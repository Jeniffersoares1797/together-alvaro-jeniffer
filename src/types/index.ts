export type EnvironmentId = 
  | "garagem" 
  | "cabana" 
  | "estrada" 
  | "quarto";

export interface Environment {
  id: EnvironmentId;
  name: string;
  tagline: string;
  description: string;
  themeColor: string;
  accentColor: string;
  palette: {
    primary: string;
    secondary: string;
    glow: string;
    surface: string;
    border: string;
    highlight: string;
  };
  decorations: {
    hasFireplace?: boolean;
    hasRain?: boolean;
    hasWindow?: boolean;
    hasLamp?: boolean;
    hasFairyLights?: boolean;
    hasCoffeeMug?: boolean;
  };
  lighting: {
    primaryGlow: string;
    secondaryGlow: string;
    ambientFilter: string;
    wallGradient: string;
    floorGradient: string;
  };
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  xPosition: number; // percentage across screen (10 - 90)
  createdAt: number;
}

export interface Memory {
  id: string;
  roomId: string;
  roomName: string;
  environmentName: string;
  timestamp: string;
  dateFormatted: string;
  timeFormatted: string;
  title: string;
  note?: string;
  activityName?: string;
  participants: string[];
  snapshotBackground?: string;
}

export interface ConversationCard {
  id: string;
  category: "profundo" | "leve" | "nostalgia" | "nos";
  categoryLabel: string;
  question: string;
  followUp?: string;
}

export interface MovieSuggestion {
  id: string;
  title: string;
  year: string;
  genre: string;
  description: string;
  duration: string;
  mood: string;
  embedUrl?: string;
}

export type ActiveActivity = 
  | "none" 
  | "conversations" 
  | "movies" 
  | "mood" 
  | "doodle";

export interface RoomState {
  roomId: string;
  roomName: string;
  environment: EnvironmentId;
  isCinemaMode: boolean;
  lampOn: boolean;
  fireplaceOn: boolean;
  activeActivity: ActiveActivity;
  screenShareActive: boolean;
  screenSharerName?: string;
}
