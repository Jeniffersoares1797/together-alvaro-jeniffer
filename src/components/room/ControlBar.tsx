"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Film,
  Sparkles,
  Heart,
  LogOut,
  Maximize2,
  Minimize2,
  SunMedium,
  Moon,
} from "lucide-react";

interface ControlBarProps {
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  isVideoEnabled: boolean;
  onToggleVideo: () => void;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  onOpenChat: () => void;
  hasUnreadMessages?: boolean;
  onOpenWatchModal: () => void;
  onOpenActivitiesModal: () => void;
  onOpenMemoriesModal: () => void;
  onOpenSettingsModal: () => void;
  isLampOn: boolean;
  onToggleLamp: () => void;
  isCinemaMode: boolean;
  onToggleCinemaMode: () => void;
  onLeaveRoom: () => void;
}

export function ControlBar({
  isAudioEnabled,
  onToggleAudio,
  isVideoEnabled,
  onToggleVideo,
  isScreenSharing,
  onToggleScreenShare,
  onOpenChat,
  hasUnreadMessages,
  onOpenWatchModal,
  onOpenActivitiesModal,
  onOpenMemoriesModal,
  isLampOn,
  onToggleLamp,
  isCinemaMode,
  onToggleCinemaMode,
  onLeaveRoom,
}: ControlBarProps) {
  return (
    <div
      className={`fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-fit px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-[#110e0c]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none transition-all duration-300 ${
        isCinemaMode ? "opacity-20 hover:opacity-100" : "opacity-100"
      }`}
    >
      {/* 1. Microfone */}
      <button
        onClick={onToggleAudio}
        className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95 ${
          isAudioEnabled
            ? "bg-white/[0.06] hover:bg-white/[0.12] text-[#ede7df]"
            : "bg-rose-950/40 text-rose-300 border border-rose-800/30"
        }`}
        title={isAudioEnabled ? "Mutar Microfone" : "Ativar Microfone"}
      >
        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </button>

      {/* 2. Câmera */}
      <button
        onClick={onToggleVideo}
        className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95 ${
          isVideoEnabled
            ? "bg-white/[0.06] hover:bg-white/[0.12] text-[#ede7df]"
            : "bg-[#1c1917] text-stone-500 hover:text-stone-300"
        }`}
        title={isVideoEnabled ? "Desligar Câmera" : "Ligar Câmera"}
      >
        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </button>

      {/* 3. Compartilhar Tela */}
      <button
        onClick={onToggleScreenShare}
        className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95 ${
          isScreenSharing
            ? "bg-amber-400 text-stone-950 font-medium"
            : "bg-white/[0.06] hover:bg-white/[0.12] text-[#ede7df]"
        }`}
        title={isScreenSharing ? "Parar Compartilhamento" : "Compartilhar Tela na TV"}
      >
        {isScreenSharing ? (
          <MonitorOff className="w-4 h-4" />
        ) : (
          <Monitor className="w-4 h-4" />
        )}
      </button>

      <div className="w-[1px] h-4 sm:h-5 bg-white/[0.08] mx-0.5 shrink-0" />

      {/* 4. Assistir (TV) */}
      <button
        onClick={onOpenWatchModal}
        className="p-2 sm:p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#ede7df] transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
        title="Assistir Vídeo / YouTube"
      >
        <Film className="w-4 h-4" />
      </button>

      {/* 5. O que fazer juntos (Atividades) */}
      <button
        onClick={onOpenActivitiesModal}
        className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300/90 border border-amber-500/20 transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
        title="O que fazer juntos?"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* 6. Nossos Momentos */}
      <button
        onClick={onOpenMemoriesModal}
        className="hidden sm:flex p-2 sm:p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-rose-300/80 hover:text-rose-200 transition-all items-center justify-center cursor-pointer shrink-0 active:scale-95"
        title="Nossos Momentos"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* 7. Conversa / Chat */}
      <button
        onClick={onOpenChat}
        className="relative p-2 sm:p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#ede7df] transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
        title="Chat"
      >
        <MessageSquare className="w-4 h-4" />
        {hasUnreadMessages && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
        )}
      </button>

      <div className="w-[1px] h-4 sm:h-5 bg-white/[0.08] mx-0.5 shrink-0" />

      {/* 8. Luz da Sala (Acender/Apagar) */}
      <button
        onClick={onToggleLamp}
        className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95 ${
          isLampOn
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            : "bg-white/[0.06] hover:bg-white/[0.12] text-stone-400 hover:text-stone-200"
        }`}
        title={isLampOn ? "Apagar a Luz da Sala (Modo Foco TV)" : "Acender a Luz da Sala"}
      >
        {isLampOn ? <SunMedium className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* 9. Modo Cinema */}
      <button
        onClick={onToggleCinemaMode}
        className={`p-2 sm:p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95 ${
          isCinemaMode
            ? "bg-amber-400 text-stone-950 font-medium"
            : "bg-white/[0.06] hover:bg-white/[0.12] text-stone-400 hover:text-white"
        }`}
        title={isCinemaMode ? "Sair do Modo Cinema" : "Modo Cinema"}
      >
        {isCinemaMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* 10. Sair da Sala */}
      <button
        onClick={onLeaveRoom}
        className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400/80 hover:text-rose-300 transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
        title="Sair da Sala"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
