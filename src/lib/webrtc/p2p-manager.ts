import { realtimeHub } from "./broadcast-signaling";
import { SignalingMessage } from "./types";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export class P2PManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private peerStreamTypes: Map<string, "screen" | "cam"> = new Map();
  private localCamStream: MediaStream | null = null;
  private localScreenStream: MediaStream | null = null;
  private currentUserId: string = "";
  private roomId: string = "";
  private onRemoteScreenStreamCallback: ((stream: MediaStream | null, senderId: string) => void) | null = null;
  private onRemoteCamStreamCallback: ((stream: MediaStream | null, senderId: string) => void) | null = null;
  private unsubscribeSignaling: (() => void) | null = null;

  public initialize(
    roomId: string,
    currentUserId: string,
    callbacks: {
      onRemoteScreenStream: (stream: MediaStream | null, senderId: string) => void;
      onRemoteCamStream: (stream: MediaStream | null, senderId: string) => void;
    }
  ) {
    this.roomId = roomId;
    this.currentUserId = currentUserId;
    this.onRemoteScreenStreamCallback = callbacks.onRemoteScreenStream;
    this.onRemoteCamStreamCallback = callbacks.onRemoteCamStream;

    this.unsubscribeSignaling = realtimeHub.subscribe(roomId, async (msg: SignalingMessage) => {
      // Ignore messages from self or destined for another peer
      if (msg.senderId === this.currentUserId) return;
      if (msg.targetId && msg.targetId !== this.currentUserId) return;

      try {
        switch (msg.type) {
          case "P2P_OFFER":
            if (msg.payload.streamType) {
              this.peerStreamTypes.set(msg.senderId, msg.payload.streamType);
            }
            await this.handleOffer(msg.senderId, msg.payload.sdp);
            break;
          case "P2P_ANSWER":
            await this.handleAnswer(msg.senderId, msg.payload.sdp);
            break;
          case "P2P_ICE_CANDIDATE":
            await this.handleIceCandidate(msg.senderId, msg.payload.candidate);
            break;
          case "SCREEN_SHARE_STOPPED":
            if (this.onRemoteScreenStreamCallback) {
              this.onRemoteScreenStreamCallback(null, msg.senderId);
            }
            this.peerStreamTypes.delete(msg.senderId);
            break;
        }
      } catch (err) {
        console.warn("P2P signaling error:", err);
      }
    });
  }

  public async broadcastCamStream(stream: MediaStream, remotePeerIds: string[]) {
    this.localCamStream = stream;

    for (const peerId of remotePeerIds) {
      if (peerId === this.currentUserId) continue;
      await this.sendMediaStreamToPeer(peerId, stream, "cam");
    }
  }

  public stopCamStream(remotePeerIds: string[]) {
    this.localCamStream = null;
  }

  public async broadcastScreenStream(stream: MediaStream, remotePeerIds: string[]) {
    this.localScreenStream = stream;

    for (const peerId of remotePeerIds) {
      if (peerId === this.currentUserId) continue;
      await this.sendMediaStreamToPeer(peerId, stream, "screen");
    }
  }

  public stopBroadcastingScreen(remotePeerIds: string[]) {
    this.localScreenStream = null;

    realtimeHub.publish({
      type: "SCREEN_SHARE_STOPPED",
      roomId: this.roomId,
      senderId: this.currentUserId,
      payload: {},
      timestamp: Date.now(),
    });
  }

  private getOrCreatePeerConnection(peerId: string): RTCPeerConnection {
    let pc = this.peerConnections.get(peerId);
    if (!pc || pc.connectionState === "closed") {
      pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateData = event.candidate.toJSON
            ? event.candidate.toJSON()
            : {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                usernameFragment: event.candidate.usernameFragment,
              };

          realtimeHub.publish({
            type: "P2P_ICE_CANDIDATE",
            roomId: this.roomId,
            senderId: this.currentUserId,
            targetId: peerId,
            payload: { candidate: candidateData },
            timestamp: Date.now(),
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          const streamType = this.peerStreamTypes.get(peerId) || "screen";

          if (streamType === "screen") {
            if (this.onRemoteScreenStreamCallback) {
              this.onRemoteScreenStreamCallback(stream, peerId);
            }
          } else {
            if (this.onRemoteCamStreamCallback) {
              this.onRemoteCamStreamCallback(stream, peerId);
            }
          }
        }
      };

      this.peerConnections.set(peerId, pc);
    }
    return pc;
  }

  private async sendMediaStreamToPeer(peerId: string, stream: MediaStream, streamType: "screen" | "cam") {
    const pc = this.getOrCreatePeerConnection(peerId);

    const senders = pc.getSenders();
    stream.getTracks().forEach((track) => {
      const existingSender = senders.find((s) => s.track?.kind === track.kind);
      if (existingSender) {
        existingSender.replaceTrack(track);
      } else {
        pc.addTrack(track, stream);
      }
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    realtimeHub.publish({
      type: "P2P_OFFER",
      roomId: this.roomId,
      senderId: this.currentUserId,
      targetId: peerId,
      payload: {
        streamType,
        sdp: {
          type: offer.type,
          sdp: offer.sdp,
        },
      },
      timestamp: Date.now(),
    });
  }

  private async handleOffer(senderId: string, sdp: RTCSessionDescriptionInit) {
    const pc = this.getOrCreatePeerConnection(senderId);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));

    // If local cam or screen stream exists, add tracks to answer
    const activeLocal = this.localScreenStream || this.localCamStream;
    if (activeLocal) {
      activeLocal.getTracks().forEach((t) => pc.addTrack(t, activeLocal));
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    realtimeHub.publish({
      type: "P2P_ANSWER",
      roomId: this.roomId,
      senderId: this.currentUserId,
      targetId: senderId,
      payload: {
        sdp: {
          type: answer.type,
          sdp: answer.sdp,
        },
      },
      timestamp: Date.now(),
    });
  }

  private async handleAnswer(senderId: string, sdp: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(senderId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  }

  private async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(senderId);
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("Could not add ICE candidate:", err);
      }
    }
  }

  public destroy() {
    if (this.unsubscribeSignaling) {
      this.unsubscribeSignaling();
      this.unsubscribeSignaling = null;
    }
    for (const pc of this.peerConnections.values()) {
      pc.close();
    }
    this.peerConnections.clear();
    this.peerStreamTypes.clear();
    this.localScreenStream = null;
    this.localCamStream = null;
  }
}

export const p2pManager = new P2PManager();
