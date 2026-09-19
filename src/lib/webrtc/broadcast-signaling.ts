import { SignalingMessage } from "./types";

type MessageHandler = (message: SignalingMessage) => void;

class RealtimeHub {
  private channels: Map<string, BroadcastChannel> = new Map();
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastPolledTimestamps: Map<string, number> = new Map();
  private seenMessageKeys: Set<string> = new Set();

  private makeMessageKey(msg: SignalingMessage): string {
    return `${msg.type}_${msg.senderId}_${msg.timestamp}_${msg.targetId || "all"}`;
  }

  public subscribe(roomId: string, currentUserId: string, handler: MessageHandler): () => void {
    if (typeof window === "undefined") return () => {};

    // 1. Setup local BroadcastChannel for same-device tab communication
    if (!this.channels.has(roomId)) {
      try {
        const channel = new BroadcastChannel(`together_room_${roomId}`);
        channel.onmessage = (event: MessageEvent<SignalingMessage>) => {
          const msg = event.data;
          if (msg && msg.roomId === roomId) {
            this.handleIncomingMessage(roomId, currentUserId, msg);
          }
        };
        this.channels.set(roomId, channel);
      } catch (e) {
        console.warn("BroadcastChannel not supported in this environment", e);
      }
    }

    // 2. Register listener
    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }
    this.listeners.get(roomId)!.add(handler);

    // 3. Start Internet Polling loop for cross-device / mobile communication
    if (!this.pollIntervals.has(roomId)) {
      // Start querying from 10 seconds ago to catch any recent sync events
      this.lastPolledTimestamps.set(roomId, Date.now() - 10000);

      const poll = async () => {
        try {
          const since = this.lastPolledTimestamps.get(roomId) || 0;
          const url = `/api/signaling?roomId=${encodeURIComponent(roomId)}&since=${since}&senderId=${encodeURIComponent(
            currentUserId
          )}`;

          const res = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          });

          if (res.ok) {
            const data = await res.json();
            if (data.messages && Array.isArray(data.messages)) {
              for (const msg of data.messages) {
                this.handleIncomingMessage(roomId, currentUserId, msg);
              }
            }
            if (data.serverTime) {
              this.lastPolledTimestamps.set(roomId, data.serverTime);
            }
          }
        } catch (err) {
          // Network errors during navigation/offline are silent
        }
      };

      // Poll immediately then every 600ms
      poll();
      const intervalId = setInterval(poll, 600);
      this.pollIntervals.set(roomId, intervalId);
    }

    // Cleanup function
    return () => {
      const roomListeners = this.listeners.get(roomId);
      if (roomListeners) {
        roomListeners.delete(handler);
        if (roomListeners.size === 0) {
          this.listeners.delete(roomId);

          // Stop poll interval
          const intervalId = this.pollIntervals.get(roomId);
          if (intervalId) {
            clearInterval(intervalId);
            this.pollIntervals.delete(roomId);
          }
          this.lastPolledTimestamps.delete(roomId);

          // Close BroadcastChannel
          const channel = this.channels.get(roomId);
          if (channel) {
            channel.close();
            this.channels.delete(roomId);
          }
        }
      }
    };
  }

  private handleIncomingMessage(roomId: string, currentUserId: string, msg: SignalingMessage) {
    if (!msg || msg.roomId !== roomId) return;

    // Ignore messages from self
    if (msg.senderId === currentUserId) return;

    // If targeted to a specific peer, ignore if not targeted to current user
    if (msg.targetId && msg.targetId !== currentUserId) return;

    // Deduplicate
    const key = this.makeMessageKey(msg);
    if (this.seenMessageKeys.has(key)) return;

    this.seenMessageKeys.add(key);
    // Keep seenMessageKeys bounded in size
    if (this.seenMessageKeys.size > 1000) {
      const firstEntry = this.seenMessageKeys.values().next().value;
      if (firstEntry) this.seenMessageKeys.delete(firstEntry);
    }

    // Dispatch to registered listeners
    const roomListeners = this.listeners.get(roomId);
    if (roomListeners) {
      roomListeners.forEach((fn) => {
        try {
          fn(msg);
        } catch (e) {
          console.error("Error in realtime message handler:", e);
        }
      });
    }
  }

  public publish(message: SignalingMessage) {
    if (typeof window === "undefined") return;

    const now = Date.now();
    const preparedMsg: SignalingMessage = {
      ...message,
      timestamp: message.timestamp || now,
    };

    // Mark as seen so sender won't self-process if looped back
    const key = this.makeMessageKey(preparedMsg);
    this.seenMessageKeys.add(key);

    // 1. Post to local BroadcastChannel for immediate same-device tab sync
    const channel = this.channels.get(preparedMsg.roomId);
    if (channel) {
      try {
        channel.postMessage(preparedMsg);
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }

    // 2. Post to /api/signaling for global cross-device internet sync
    try {
      fetch("/api/signaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedMsg),
        keepalive: true,
      }).catch((e) => {
        console.warn("Error posting signal to server:", e);
      });
    } catch (e) {
      console.warn("Error initiating signal fetch:", e);
    }
  }
}

export const realtimeHub = new RealtimeHub();
