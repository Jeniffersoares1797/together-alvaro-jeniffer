import { realtimeHub } from "./broadcast-signaling";
import { SignalingMessage } from "./types";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
  iceCandidatePoolSize: 10,
};

export class P2PManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private peerStreamTypes: Map<string, "screen" | "cam"> = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private remoteScreenStreams: Map<string, MediaStream> = new Map();
  private remoteCamStreams: Map<string, MediaStream> = new Map();

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

    this.unsubscribeSignaling = realtimeHub.subscribe(roomId, currentUserId, async (msg: SignalingMessage) => {
      // Ignore messages from self or destined for another peer
      if (msg.senderId === this.currentUserId) return;
      if (msg.targetId && msg.targetId !== this.currentUserId) return;

      try {
        switch (msg.type) {
          case "P2P_OFFER":
            if (msg.payload.streamType) {
              this.peerStreamTypes.set(msg.senderId, msg.payload.streamType);
            }
            await this.handleOffer(msg.senderId, msg.payload.sdp, msg.payload.streamType);
            break;

          case "P2P_ANSWER":
            await this.handleAnswer(msg.senderId, msg.payload.sdp);
            break;

          case "P2P_ICE_CANDIDATE":
            await this.handleIceCandidate(msg.senderId, msg.payload.candidate);
            break;

          case "SCREEN_SHARE_STARTED":
            this.peerStreamTypes.set(msg.senderId, "screen");
            break;

          case "SCREEN_SHARE_STOPPED":
            this.peerStreamTypes.delete(msg.senderId);
            this.remoteScreenStreams.delete(msg.senderId);
            if (this.onRemoteScreenStreamCallback) {
              this.onRemoteScreenStreamCallback(null, msg.senderId);
            }
            break;
        }
      } catch (err) {
        console.warn("P2P signaling processing error:", err);
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

    // First broadcast event that screen share has started
    realtimeHub.publish({
      type: "SCREEN_SHARE_STARTED",
      roomId: this.roomId,
      senderId: this.currentUserId,
      payload: { sharerId: this.currentUserId },
      timestamp: Date.now(),
    });

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
      payload: { sharerId: this.currentUserId },
      timestamp: Date.now(),
    });
  }

  private getOrCreatePeerConnection(peerId: string): RTCPeerConnection {
    let pc = this.peerConnections.get(peerId);
    if (!pc || pc.connectionState === "closed" || pc.connectionState === "failed") {
      if (pc) {
        try {
          pc.close();
        } catch {}
      }

      pc = new RTCPeerConnection(ICE_SERVERS);

      // Handle ICE Candidate generation
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

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc?.connectionState === "failed") {
          console.warn(`P2P Connection to ${peerId} failed. Attempting restart...`);
          pc.restartIce();
        }
      };

      // Handle incoming remote media tracks (Screen share or Camera)
      pc.ontrack = (event) => {
        const streamType = this.peerStreamTypes.get(peerId) || "screen";
        let targetStream =
          event.streams && event.streams[0]
            ? event.streams[0]
            : streamType === "screen"
            ? this.remoteScreenStreams.get(peerId) || new MediaStream()
            : this.remoteCamStreams.get(peerId) || new MediaStream();

        // Ensure track is inside the target stream
        if (!targetStream.getTracks().some((t) => t.id === event.track.id)) {
          targetStream.addTrack(event.track);
        }

        if (streamType === "screen") {
          this.remoteScreenStreams.set(peerId, targetStream);
          if (this.onRemoteScreenStreamCallback) {
            this.onRemoteScreenStreamCallback(targetStream, peerId);
          }
        } else {
          this.remoteCamStreams.set(peerId, targetStream);
          if (this.onRemoteCamStreamCallback) {
            this.onRemoteCamStreamCallback(targetStream, peerId);
          }
        }
      };

      this.peerConnections.set(peerId, pc);
    }
    return pc;
  }

  private async sendMediaStreamToPeer(peerId: string, stream: MediaStream, streamType: "screen" | "cam") {
    const pc = this.getOrCreatePeerConnection(peerId);

    // Track existing senders
    const senders = pc.getSenders();
    stream.getTracks().forEach((track) => {
      const existingSender = senders.find((s) => s.track?.kind === track.kind);
      if (existingSender) {
        existingSender.replaceTrack(track).catch((e) => {
          console.warn("Could not replace track, adding new track", e);
          pc.addTrack(track, stream);
        });
      } else {
        pc.addTrack(track, stream);
      }
    });

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
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

  private async handleOffer(senderId: string, sdp: RTCSessionDescriptionInit, streamType?: "screen" | "cam") {
    if (streamType) {
      this.peerStreamTypes.set(senderId, streamType);
    }

    const pc = this.getOrCreatePeerConnection(senderId);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));

    // Drain queued ICE candidates
    await this.drainPendingCandidates(senderId, pc);

    // If local cam or screen stream exists, add tracks to answer
    const activeLocal = this.localScreenStream || this.localCamStream;
    if (activeLocal) {
      const senders = pc.getSenders();
      activeLocal.getTracks().forEach((track) => {
        const existing = senders.find((s) => s.track?.kind === track.kind);
        if (!existing) {
          pc.addTrack(track, activeLocal);
        }
      });
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
      // Drain queued ICE candidates
      await this.drainPendingCandidates(senderId, pc);
    }
  }

  private async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(senderId);

    if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
      // Queue candidate until remote description is set
      if (!this.pendingCandidates.has(senderId)) {
        this.pendingCandidates.set(senderId, []);
      }
      this.pendingCandidates.get(senderId)!.push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("Could not add ICE candidate directly:", err);
    }
  }

  private async drainPendingCandidates(senderId: string, pc: RTCPeerConnection) {
    const queued = this.pendingCandidates.get(senderId);
    if (queued && queued.length > 0) {
      for (const cand of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn("Error adding queued ICE candidate:", e);
        }
      }
      this.pendingCandidates.delete(senderId);
    }
  }

  public destroy() {
    if (this.unsubscribeSignaling) {
      this.unsubscribeSignaling();
      this.unsubscribeSignaling = null;
    }
    for (const pc of this.peerConnections.values()) {
      try {
        pc.close();
      } catch {}
    }
    this.peerConnections.clear();
    this.peerStreamTypes.clear();
    this.pendingCandidates.clear();
    this.remoteScreenStreams.clear();
    this.remoteCamStreams.clear();
    this.localScreenStream = null;
    this.localCamStream = null;
  }
}

export const p2pManager = new P2PManager();
