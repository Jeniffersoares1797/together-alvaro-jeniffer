import { SignalingMessage } from "./types";

type MessageHandler = (message: SignalingMessage) => void;

class RealtimeHub {
  private channels: Map<string, BroadcastChannel> = new Map();
  private listeners: Map<string, Set<MessageHandler>> = new Map();

  public subscribe(roomId: string, handler: MessageHandler): () => void {
    if (typeof window === "undefined") return () => {};

    if (!this.channels.has(roomId)) {
      const channel = new BroadcastChannel(`together_room_${roomId}`);
      channel.onmessage = (event: MessageEvent<SignalingMessage>) => {
        const msg = event.data;
        if (msg && msg.roomId === roomId) {
          const roomListeners = this.listeners.get(roomId);
          if (roomListeners) {
            roomListeners.forEach((fn) => fn(msg));
          }
        }
      };
      this.channels.set(roomId, channel);
    }

    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }

    this.listeners.get(roomId)!.add(handler);

    return () => {
      const roomListeners = this.listeners.get(roomId);
      if (roomListeners) {
        roomListeners.delete(handler);
        if (roomListeners.size === 0) {
          this.listeners.delete(roomId);
          const channel = this.channels.get(roomId);
          if (channel) {
            channel.close();
            this.channels.delete(roomId);
          }
        }
      }
    };
  }

  public publish(message: SignalingMessage) {
    if (typeof window === "undefined") return;

    const channel = this.channels.get(message.roomId);
    if (channel) {
      try {
        channel.postMessage(message);
      } catch (err) {
        console.error("Error publishing message:", err);
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
