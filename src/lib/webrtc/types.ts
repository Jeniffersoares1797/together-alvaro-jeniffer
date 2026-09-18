import { ChatMessage, EnvironmentId, FloatingReaction, Participant, ActiveActivity } from "@/types";

export type SignalingMessageType =
  | "PEER_JOIN"
  | "PEER_LEAVE"
  | "PEER_UPDATE"
  | "CHAT_MESSAGE"
  | "REACTION"
  | "ROOM_UPDATE"
  | "CINEMA_TOGGLE"
  | "LAMP_TOGGLE"
  | "ACTIVITY_CHANGE"
  | "DOODLE_DRAW"
  | "DOODLE_CLEAR"
  | "WATCH_SYNC"
  | "P2P_OFFER"
  | "P2P_ANSWER"
  | "P2P_ICE_CANDIDATE"
  | "SCREEN_SHARE_STOPPED";

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  senderId: string;
  targetId?: string; // for direct 1-to-1 WebRTC signaling
  payload: any;
  timestamp: number;
}
