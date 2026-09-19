"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { EnvironmentId, Participant, ChatMessage, FloatingReaction, ActiveActivity } from "@/types";
import { ENVIRONMENTS } from "@/lib/data/environments";
import { mediaManager } from "@/lib/webrtc/media-manager";
import { realtimeHub } from "@/lib/webrtc/broadcast-signaling";
import { p2pManager } from "@/lib/webrtc/p2p-manager";
import { useMemories } from "@/lib/store/use-memories";
import { soundscape } from "@/lib/audio/soundscapes";

// Components
import { RoomScene } from "@/components/room/RoomScene";
import { RoomHeader } from "@/components/room/RoomHeader";
import { VirtualTV } from "@/components/room/VirtualTV";
import { LeftCameraDock } from "@/components/room/LeftCameraDock";
import { ControlBar } from "@/components/room/ControlBar";
import { FloatingReactionsOverlay } from "@/components/room/FloatingReactionsOverlay";

// Modals
import { ChatDrawer } from "@/components/modals/ChatDrawer";
import { ActivitiesModal } from "@/components/modals/ActivitiesModal";
import { MemoriesModal } from "@/components/modals/MemoriesModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { WatchModal } from "@/components/modals/WatchModal";
import { InviteModal } from "@/components/modals/InviteModal";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = (params?.roomId as string) || "room-default";

  // Persistent user & room config from localStorage or defaults
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar: string;
    color: string;
    isHost: boolean;
  }>({
    id: `user-${Math.random().toString(36).substring(2, 7)}`,
    name: "Você",
    avatar: "V",
    color: "from-amber-600 to-amber-500",
    isHost: true,
  });

  const [roomName, setRoomName] = useState("Nosso Cantinho");
  const [environmentId, setEnvironmentId] = useState<EnvironmentId>("garagem");

  // Media & Device States
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [localCamStream, setLocalCamStream] = useState<MediaStream | null>(null);
  const [remoteCamStreams, setRemoteCamStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);
  const [screenSharerName, setScreenSharerName] = useState<string | undefined>(undefined);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Atmosphere States
  const [isLampOn, setIsLampOn] = useState(true);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isRainSoundOn, setIsRainSoundOn] = useState(false);

  // Video / Watch Party States
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(undefined);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string | undefined>(undefined);

  // Realtime Data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Active Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [activeActivityTab, setActiveActivityTab] = useState<ActiveActivity>("conversations");
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWatchOpen, setIsWatchOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { memories, saveMemory, deleteMemory } = useMemories();
  const participantsRef = useRef<Participant[]>([]);
  participantsRef.current = participants;

  // Quick identity selection modal state (if joining directly via link without saved profile)
  const [needsProfileSelection, setNeedsProfileSelection] = useState(false);
  const [customJoinName, setCustomJoinName] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialize user from localStorage or trigger profile picker
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(`together_user_${roomId}`);
      const storedEnv = localStorage.getItem(`together_env_${roomId}`) as EnvironmentId;
      const storedName = localStorage.getItem(`together_name_${roomId}`);

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setCurrentUser({
            id: parsed.id || `user-${Math.random().toString(36).substring(2, 7)}`,
            name: parsed.name || "Você",
            avatar: parsed.avatar || (parsed.name ? parsed.name.charAt(0).toUpperCase() : "V"),
            color: parsed.color || "bg-[#2b2219] text-amber-300 border-[#4a3a2a]",
            isHost: !!parsed.isHost,
          });
          setNeedsProfileSelection(false);
        } catch (e) {
          setNeedsProfileSelection(true);
        }
      } else {
        // Direct link visitor without prior profile
        setNeedsProfileSelection(true);
      }

      if (storedEnv && ENVIRONMENTS[storedEnv]) {
        setEnvironmentId(storedEnv);
      }
      if (storedName) {
        setRoomName(storedName);
      }

      // Initial system message
      setChatMessages([
        {
          id: "sys-init",
          senderId: "system",
          senderName: "Together",
          senderColor: "",
          content: `Nosso lugar está pronto. Sente-se, relaxe e aproveite o momento.`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          isSystem: true,
        },
      ]);
    }
  }, [roomId]);

  // Handler for 1-click identity selection for direct link visitors
  const handleSelectIdentity = (name: string, color: string) => {
    const avatar = name.charAt(0).toUpperCase();
    const newUser = {
      id: `user-${Math.random().toString(36).substring(2, 7)}`,
      name,
      avatar,
      color,
      isHost: false,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`together_user_${roomId}`, JSON.stringify(newUser));
    }

    setCurrentUser(newUser);
    setNeedsProfileSelection(false);
    showToast(`Entrou como ${name} ✨`);
  };

  // 2. Initialize P2P WebRTC manager for Screen Share & HD Camera
  useEffect(() => {
    p2pManager.initialize(roomId, currentUser.id, {
      onRemoteScreenStream: (stream, senderId) => {
        if (stream) {
          setRemoteScreenStream(stream);
          const sender = participantsRef.current.find((p) => p.id === senderId);
          setScreenSharerName(sender?.name || "Participante");
          showToast(`${sender?.name || "Alguém"} iniciou a transmissão de tela na TV!`);
        } else {
          setRemoteScreenStream(null);
          setScreenSharerName(undefined);
        }
      },
      onRemoteCamStream: (stream, senderId) => {
        if (stream) {
          setRemoteCamStreams((prev) => {
            const next = new Map(prev);
            next.set(senderId, stream);
            return next;
          });
        } else {
          setRemoteCamStreams((prev) => {
            const next = new Map(prev);
            next.delete(senderId);
            return next;
          });
        }
      },
    });

    return () => {
      p2pManager.destroy();
    };
  }, [roomId, currentUser.id]);

  // 3. Connect Voice Activity Detector to media manager
  useEffect(() => {
    mediaManager.setOnSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  const peerLastSeenMap = useRef<Map<string, number>>(new Map());

  // 4. Multi-peer / Multi-device Realtime Hub Subscription & Bi-directional Handshake
  useEffect(() => {
    if (needsProfileSelection) return;

    const myParticipant: Participant = {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      color: currentUser.color,
      isHost: currentUser.isHost,
      isAudioEnabled,
      isVideoEnabled,
      isScreenSharing,
      isSpeaking,
      joinedAt: new Date().toISOString(),
    };

    // Update local state participants list with self
    setParticipants((prev) => {
      const others = prev.filter((p) => p.id !== currentUser.id);
      return [myParticipant, ...others];
    });

    // Subscribe to realtime channel
    const unsubscribe = realtimeHub.subscribe(roomId, currentUser.id, (msg) => {
      // Record heartbeat for sender
      if (msg.senderId && msg.senderId !== currentUser.id) {
        peerLastSeenMap.current.set(msg.senderId, Date.now());
      }

      switch (msg.type) {
        case "PEER_JOIN": {
          const newPeer = msg.payload as Participant;
          if (newPeer.id !== currentUser.id) {
            peerLastSeenMap.current.set(newPeer.id, Date.now());
            setParticipants((prev) => {
              const others = prev.filter((p) => p.id !== newPeer.id);
              return [...others, newPeer];
            });

            // Immediately reply back to the joining peer with our state & room state
            realtimeHub.publish({
              type: "PEER_SYNC_REPLY",
              roomId,
              senderId: currentUser.id,
              targetId: newPeer.id,
              payload: {
                participant: myParticipant,
                roomState: {
                  environmentId,
                  roomName,
                  isLampOn,
                  isCinemaMode,
                  currentVideoUrl,
                  currentVideoTitle,
                },
              },
              timestamp: Date.now(),
            });

            showToast(`${newPeer.name} entrou no nosso lugar! ❤️`);

            // If streaming, send media to newly joined peer
            if (localScreenStream && isScreenSharing) {
              p2pManager.broadcastScreenStream(localScreenStream, [newPeer.id]);
            }
            if (localCamStream && isVideoEnabled) {
              p2pManager.broadcastCamStream(localCamStream, [newPeer.id]);
            }
          }
          break;
        }

        case "PEER_SYNC_REPLY": {
          const syncData = msg.payload;
          if (syncData && syncData.participant) {
            const peer = syncData.participant as Participant;
            peerLastSeenMap.current.set(peer.id, Date.now());
            setParticipants((prev) => {
              const others = prev.filter((p) => p.id !== peer.id);
              return [...others, peer];
            });

            // Sync room state from peer if provided
            if (syncData.roomState) {
              if (syncData.roomState.environmentId) setEnvironmentId(syncData.roomState.environmentId);
              if (syncData.roomState.roomName) setRoomName(syncData.roomState.roomName);
              if (typeof syncData.roomState.isLampOn === "boolean") setIsLampOn(syncData.roomState.isLampOn);
              if (typeof syncData.roomState.isCinemaMode === "boolean") setIsCinemaMode(syncData.roomState.isCinemaMode);
              if (syncData.roomState.currentVideoUrl) {
                setCurrentVideoUrl(syncData.roomState.currentVideoUrl);
                setCurrentVideoTitle(syncData.roomState.currentVideoTitle);
              }
            }

            showToast(`${peer.name} está aqui com você! ✨`);

            // If streaming, broadcast to this peer
            if (localScreenStream && isScreenSharing) {
              p2pManager.broadcastScreenStream(localScreenStream, [peer.id]);
            }
            if (localCamStream && isVideoEnabled) {
              p2pManager.broadcastCamStream(localCamStream, [peer.id]);
            }
          }
          break;
        }

        case "PEER_UPDATE":
        case "PEER_PING": {
          const peer = msg.payload as Participant;
          if (peer.id !== currentUser.id) {
            peerLastSeenMap.current.set(peer.id, Date.now());
            setParticipants((prev) => {
              const others = prev.filter((p) => p.id !== peer.id);
              return [...others, peer];
            });
          }
          break;
        }

        case "PEER_LEAVE": {
          const peerId = msg.payload.id || msg.senderId;
          const leavingPeer = participantsRef.current.find((p) => p.id === peerId);
          peerLastSeenMap.current.delete(peerId);
          setParticipants((prev) => prev.filter((p) => p.id !== peerId));
          setRemoteCamStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
          if (remoteScreenStream) {
            setRemoteScreenStream(null);
            setScreenSharerName(undefined);
          }
          if (leavingPeer) {
            showToast(`${leavingPeer.name} saiu do nosso lugar.`);
          }
          break;
        }

        case "CHAT_MESSAGE": {
          const chatMsg = msg.payload as ChatMessage;
          setChatMessages((prev) => [...prev, chatMsg]);
          if (!isChatOpen && chatMsg.senderId !== currentUser.id) {
            setHasUnreadMessages(true);
          }
          break;
        }

        case "REACTION": {
          const react = msg.payload as FloatingReaction;
          if (react && react.emoji) {
            setFloatingReactions((prev) => [...prev, react]);
            setTimeout(() => {
              setFloatingReactions((prev) => prev.filter((r) => r.id !== react.id));
            }, 3200);
          }
          break;
        }

        case "ROOM_UPDATE": {
          if (msg.payload.environmentId) setEnvironmentId(msg.payload.environmentId);
          if (msg.payload.roomName) setRoomName(msg.payload.roomName);
          break;
        }

        case "CINEMA_TOGGLE": {
          setIsCinemaMode(msg.payload.isCinemaMode);
          break;
        }

        case "LAMP_TOGGLE": {
          setIsLampOn(msg.payload.isLampOn);
          break;
        }

        case "WATCH_SYNC": {
          setCurrentVideoUrl(msg.payload.url);
          setCurrentVideoTitle(msg.payload.title);
          showToast(`Vídeo sincronizado: ${msg.payload.title}`);
          break;
        }

        case "SCREEN_SHARE_STARTED": {
          const sender = participantsRef.current.find((p) => p.id === msg.senderId);
          setScreenSharerName(sender?.name || "Participante");
          showToast(`${sender?.name || "Alguém"} iniciou a transmissão de tela na TV! 📺`);
          break;
        }

        case "SCREEN_SHARE_STOPPED": {
          setRemoteScreenStream(null);
          setScreenSharerName(undefined);
          showToast("Transmissão de tela encerrada.");
          break;
        }
      }
    });

    // 5. Broadcast our presence to the room
    realtimeHub.publish({
      type: "PEER_JOIN",
      roomId,
      senderId: currentUser.id,
      payload: myParticipant,
      timestamp: Date.now(),
    });

    // 6. Keep-alive heartbeat ping every 5 seconds
    const pingInterval = setInterval(() => {
      realtimeHub.publish({
        type: "PEER_PING",
        roomId,
        senderId: currentUser.id,
        payload: myParticipant,
        timestamp: Date.now(),
      });
    }, 5000);

    // 7. Watchdog: prune disconnected / closed peers after 15s without ping
    const watchdogInterval = setInterval(() => {
      const now = Date.now();
      const otherPeers = participantsRef.current.filter((p) => p.id !== currentUser.id);
      let changed = false;

      const activeOthers = otherPeers.filter((p) => {
        const lastSeen = peerLastSeenMap.current.get(p.id);
        // If peer hasn't sent ping in 15 seconds, mark as left
        if (lastSeen && now - lastSeen > 15000) {
          changed = true;
          peerLastSeenMap.current.delete(p.id);
          setRemoteCamStreams((prev) => {
            const next = new Map(prev);
            next.delete(p.id);
            return next;
          });
          showToast(`${p.name} saiu do nosso lugar.`);
          return false;
        }
        return true;
      });

      if (changed) {
        setParticipants([myParticipant, ...activeOthers]);
      }
    }, 3500);

    // 8. Handle tab close / window unload / navigation
    const handleUnload = () => {
      realtimeHub.publish({
        type: "PEER_LEAVE",
        roomId,
        senderId: currentUser.id,
        payload: { id: currentUser.id, name: currentUser.name },
        timestamp: Date.now(),
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      clearInterval(pingInterval);
      clearInterval(watchdogInterval);
      handleUnload();
      unsubscribe();
    };
  }, [
    roomId,
    currentUser,
    needsProfileSelection,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isSpeaking,
    isChatOpen,
    environmentId,
    roomName,
    isLampOn,
    isCinemaMode,
    currentVideoUrl,
    currentVideoTitle,
    localScreenStream,
    localCamStream,
  ]);

  // Toggle Audio (getUserMedia)
  const handleToggleAudio = async () => {
    if (!isAudioEnabled) {
      const res = await mediaManager.startAudioVideo(isVideoEnabled, true);
      if (res.stream) {
        setIsAudioEnabled(true);
        setLocalCamStream(res.stream);
        const peerIds = participants.filter((p) => p.id !== currentUser.id).map((p) => p.id);
        p2pManager.broadcastCamStream(res.stream, peerIds);
      } else if (!res.cancelled && res.error) {
        showToast(res.error);
      }
    } else {
      mediaManager.toggleAudio(false);
      setIsAudioEnabled(false);
    }
  };

  // Toggle Video (getUserMedia HD 1080p)
  const handleToggleVideo = async () => {
    if (!isVideoEnabled) {
      const res = await mediaManager.startAudioVideo(true, isAudioEnabled);
      if (res.stream) {
        setIsVideoEnabled(true);
        setLocalCamStream(res.stream);
        const peerIds = participantsRef.current.filter((p) => p.id !== currentUser.id).map((p) => p.id);
        p2pManager.broadcastCamStream(res.stream, peerIds);
        showToast("Câmera ativada!");
      } else if (!res.cancelled && res.error) {
        showToast(res.error);
      }
    } else {
      mediaManager.toggleVideo(false);
      setIsVideoEnabled(false);
      const peerIds = participantsRef.current.filter((p) => p.id !== currentUser.id).map((p) => p.id);
      p2pManager.stopCamStream(peerIds);
    }
  };

  // Screen Sharing with WebRTC P2P stream broadcast
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      mediaManager.stopScreenShare();
      setLocalScreenStream(null);
      setIsScreenSharing(false);
      const peerIds = participantsRef.current.filter((p) => p.id !== currentUser.id).map((p) => p.id);
      p2pManager.stopBroadcastingScreen(peerIds);
    } else {
      const res = await mediaManager.startScreenShare();
      if (res.stream) {
        setCurrentVideoUrl(undefined);
        setCurrentVideoTitle(undefined);
        setLocalScreenStream(res.stream);
        setIsScreenSharing(true);

        const peerIds = participantsRef.current.filter((p) => p.id !== currentUser.id).map((p) => p.id);
        p2pManager.broadcastScreenStream(res.stream, peerIds);
        handleSendMessage("iniciou o compartilhamento de tela + áudio na TV.");

        const videoTrack = res.stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            setLocalScreenStream(null);
            setIsScreenSharing(false);
            const currentPeers = participantsRef.current.filter((p) => p.id !== currentUser.id).map((p) => p.id);
            p2pManager.stopBroadcastingScreen(currentPeers);
          };
        }
      } else if (!res.cancelled && res.error) {
        showToast(res.error);
      }
    }
  };

  // Chat message sender
  const handleSendMessage = (content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderColor: currentUser.color,
      content,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    realtimeHub.publish({
      type: "CHAT_MESSAGE",
      roomId,
      senderId: currentUser.id,
      payload: newMsg,
      timestamp: Date.now(),
    });
  };

  // Personal reaction sender
  const handleSendReaction = (emoji: string) => {
    const reaction: FloatingReaction = {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji,
      senderName: currentUser.name,
      xPosition: Math.floor(Math.random() * 30) + 65,
      createdAt: Date.now(),
    };

    setFloatingReactions((prev) => [...prev, reaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 3200);

    realtimeHub.publish({
      type: "REACTION",
      roomId,
      senderId: currentUser.id,
      payload: reaction,
      timestamp: Date.now(),
    });
  };

  // Environment Switcher
  const handleChangeEnvironment = (newEnvId: EnvironmentId) => {
    setEnvironmentId(newEnvId);
    if (typeof window !== "undefined") {
      localStorage.setItem(`together_env_${roomId}`, newEnvId);
    }

    realtimeHub.publish({
      type: "ROOM_UPDATE",
      roomId,
      senderId: currentUser.id,
      payload: { environmentId: newEnvId },
      timestamp: Date.now(),
    });

    handleSendMessage(`mudou o ambiente para "${ENVIRONMENTS[newEnvId].name}"`);
  };

  // Cinema Mode Toggle
  const handleToggleCinemaMode = () => {
    const nextState = !isCinemaMode;
    setIsCinemaMode(nextState);

    realtimeHub.publish({
      type: "CINEMA_TOGGLE",
      roomId,
      senderId: currentUser.id,
      payload: { isCinemaMode: nextState },
      timestamp: Date.now(),
    });
  };

  // Lamp / Room Light Toggle
  const handleToggleLamp = () => {
    const nextState = !isLampOn;
    setIsLampOn(nextState);

    realtimeHub.publish({
      type: "LAMP_TOGGLE",
      roomId,
      senderId: currentUser.id,
      payload: { isLampOn: nextState },
      timestamp: Date.now(),
    });

    if (nextState) {
      showToast("Luz da sala acesa ✨");
    } else {
      showToast("Luz apagada — foco total no filme 🎬");
    }
  };

  // Save Moment
  const handleSaveMoment = (title: string, note?: string) => {
    const participantNames = participants.map((p) => p.name);
    saveMemory({
      roomId,
      roomName,
      environmentName: ENVIRONMENTS[environmentId].name,
      title,
      note,
      participants: participantNames,
    });

    showToast(`Momento "${title}" guardado com carinho!`);
    handleSendReaction("❤️");
  };

  // Rain Ambient Audio Toggle
  const handleToggleRainSound = () => {
    const nextState = !isRainSoundOn;
    setIsRainSoundOn(nextState);

    if (nextState) {
      soundscape?.play("rain", 0.4);
      showToast("Chuva suave lá fora ligada 🌧️");
    } else {
      soundscape?.stop();
      showToast("Som de chuva pausado");
    }
  };

  // Leave Room
  const handleLeaveRoom = () => {
    realtimeHub.publish({
      type: "PEER_LEAVE",
      roomId,
      senderId: currentUser.id,
      payload: { id: currentUser.id, name: currentUser.name },
      timestamp: Date.now(),
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(`together_user_${roomId}`);
    }
    soundscape?.stop();
    mediaManager.stopAll();
    p2pManager.destroy();
    router.push("/");
  };

  const activeScreenStream = localScreenStream || remoteScreenStream;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#080706] select-none">
      {/* Top Room Header */}
      <RoomHeader
        roomId={roomId}
        roomName={roomName}
        environmentId={environmentId}
        onChangeEnvironment={handleChangeEnvironment}
        onInviteClick={() => setIsInviteOpen(true)}
        onSaveMomentClick={() => setIsMemoriesOpen(true)}
        isLampOn={isLampOn}
        onToggleLamp={handleToggleLamp}
        isCinemaMode={isCinemaMode}
      />

      {/* Floating Left Camera Dock (Adjustable P/M/G & always accessible) */}
      <LeftCameraDock
        participants={participants}
        currentUserId={currentUser.id}
        isCinemaMode={isCinemaMode}
        localStream={localCamStream}
        remoteCamStreams={remoteCamStreams}
        onInviteClick={() => setIsInviteOpen(true)}
      />

      {/* Discreet Personal Reactions */}
      <FloatingReactionsOverlay reactions={floatingReactions} />

      {/* Main Room Scene */}
      <RoomScene
        environmentId={environmentId}
        isLampOn={isLampOn}
        onToggleLamp={handleToggleLamp}
        isCinemaMode={isCinemaMode}
      >
        {/* Central Virtual OLED TV / Projector */}
        <VirtualTV
          screenStream={activeScreenStream}
          isScreenSharingByMe={isScreenSharing}
          screenSharerName={screenSharerName}
          onStopScreenShare={handleToggleScreenShare}
          videoUrl={currentVideoUrl}
          videoTitle={currentVideoTitle}
          isCinemaMode={isCinemaMode}
          isLampOn={isLampOn}
          onToggleCinemaMode={handleToggleCinemaMode}
          onOpenWatchModal={() => setIsWatchOpen(true)}
          environmentThemeColor={ENVIRONMENTS[environmentId].accentColor}
        />
      </RoomScene>

      {/* Bottom Floating Control Bar (Clean and unblocked) */}
      <ControlBar
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        isVideoEnabled={isVideoEnabled}
        onToggleVideo={handleToggleVideo}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={handleToggleScreenShare}
        onOpenChat={() => {
          setIsChatOpen(true);
          setHasUnreadMessages(false);
        }}
        hasUnreadMessages={hasUnreadMessages}
        onOpenWatchModal={() => setIsWatchOpen(true)}
        onOpenActivitiesModal={() => setIsActivitiesOpen(true)}
        onOpenMemoriesModal={() => setIsMemoriesOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        isLampOn={isLampOn}
        onToggleLamp={handleToggleLamp}
        isCinemaMode={isCinemaMode}
        onToggleCinemaMode={handleToggleCinemaMode}
        isRainSoundOn={isRainSoundOn}
        onToggleRainSound={handleToggleRainSound}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Elegant Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl glass-panel border border-amber-500/30 text-xs text-amber-200 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        currentUserId={currentUser.id}
        onSendMessage={handleSendMessage}
        onSendReaction={handleSendReaction}
      />

      <ActivitiesModal
        isOpen={isActivitiesOpen}
        onClose={() => setIsActivitiesOpen(false)}
        activeTab={activeActivityTab}
        onSelectActivity={setActiveActivityTab}
        onShareMood={(moodText, emoji) => {
          handleSendMessage(`está se sentindo: ${moodText}`);
          handleSendReaction(emoji);
        }}
        onSaveMoment={handleSaveMoment}
      />

      <MemoriesModal
        isOpen={isMemoriesOpen}
        onClose={() => setIsMemoriesOpen(false)}
        memories={memories}
        onSaveNewMemory={handleSaveMoment}
        onDeleteMemory={deleteMemory}
        currentRoomName={roomName}
        currentEnvName={ENVIRONMENTS[environmentId].name}
        participants={participants.map((p) => p.name)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isLampOn={isLampOn}
        onToggleLamp={() => setIsLampOn(!isLampOn)}
      />

      <WatchModal
        isOpen={isWatchOpen}
        onClose={() => setIsWatchOpen(false)}
        onSetVideoUrl={(url, title) => {
          if (isScreenSharing) {
            mediaManager.stopScreenShare();
            setLocalScreenStream(null);
            setIsScreenSharing(false);
            const peerIds = participants.filter((p) => p.id !== currentUser.id).map((p) => p.id);
            p2pManager.stopBroadcastingScreen(peerIds);
          }
          setCurrentVideoUrl(url);
          setCurrentVideoTitle(title);
          handleSendMessage(`espelhou "${title}" na TV da sala.`);
          realtimeHub.publish({
            type: "WATCH_SYNC",
            roomId,
            senderId: currentUser.id,
            payload: { url, title },
            timestamp: Date.now(),
          });
        }}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomId={roomId}
        roomName={roomName}
      />

      {/* Direct Link Visitor Identity Picker Modal */}
      {needsProfileSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#120f0d] border border-amber-500/30 shadow-2xl p-6 sm:p-8 text-[#ede7df] text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 mx-auto mb-4">
              <span className="text-xl">✨</span>
            </div>

            <h2 className="text-xl font-medium text-[#ede7df]">
              Bem-vindo(a) ao nosso lugar!
            </h2>
            <p className="text-xs text-stone-400 mt-1 mb-6">
              Quem está entrando agora para passarmos tempo juntos?
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => handleSelectIdentity("Alvaro", "bg-[#2b2219] text-amber-300 border-[#4a3a2a]")}
                className="p-4 rounded-2xl bg-[#1c1815] border border-[#3d3226] hover:border-amber-400/60 transition-all flex flex-col items-center gap-2 cursor-pointer group active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-[#2b2219] border-2 border-[#4a3a2a] group-hover:border-amber-400 flex items-center justify-center text-amber-300 font-bold text-lg">
                  A
                </div>
                <div className="text-sm font-semibold text-[#ede7df] group-hover:text-amber-300">
                  Álvaro
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectIdentity("Jeniffer", "bg-[#2e1c18] text-rose-300 border-[#4a2e27]")}
                className="p-4 rounded-2xl bg-[#1c1815] border border-[#3d2520] hover:border-rose-400/60 transition-all flex flex-col items-center gap-2 cursor-pointer group active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-[#2e1c18] border-2 border-[#4a2e27] group-hover:border-rose-400 flex items-center justify-center text-rose-300 font-bold text-lg">
                  J
                </div>
                <div className="text-sm font-semibold text-[#ede7df] group-hover:text-rose-300">
                  Jeniffer
                </div>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customJoinName.trim()) {
                  handleSelectIdentity(customJoinName.trim(), "bg-[#1f242e] text-blue-300 border-[#323d4f]");
                }
              }}
              className="mt-3 flex items-center gap-2 pt-3 border-t border-white/10"
            >
              <input
                type="text"
                value={customJoinName}
                onChange={(e) => setCustomJoinName(e.target.value)}
                placeholder="Ou digite outro nome..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090807] border border-white/10 text-xs text-[#ede7df] placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50"
              />
              <button
                type="submit"
                disabled={!customJoinName.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-stone-950 text-xs font-semibold shrink-0 cursor-pointer transition-all"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
