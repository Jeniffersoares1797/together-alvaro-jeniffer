

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Maximize2, Minimize2, Plus, Users, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Participant } from "@/types";

export type CamGridSize = "sm" | "md" | "lg";

interface LeftCameraDockProps {
  participants: Participant[];
  currentUserId: string;
  isCinemaMode: boolean;
  localStream: MediaStream | null;
  remoteCamStreams: Map<string, MediaStream>;
  onInviteClick: () => void;
}

function CameraFeedCard({
  stream,
  isSelf,
  participant,
  size,
}: {
  stream: MediaStream | null;
  isSelf: boolean;
  participant: Participant;
  size: CamGridSize;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = isSelf; // Mute self playback to avoid feedback
      videoRef.current.play().catch((err) => {
        console.warn("Camera auto-play:", err);
      });
    }
  }, [stream, isSelf]);

  const sizeClasses = {
    sm: "w-52 h-34 sm:w-64 sm:h-44",
    md: "w-60 h-40 sm:w-80 sm:h-54",
    lg: "w-72 h-48 sm:w-96 sm:h-66",
  }[size];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#0a0908] border transition-all duration-300 shadow-2xl group max-w-[calc(100vw-2.5rem)] ${
        participant.isSpeaking
          ? "border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40"
          : "border-white/[0.09] hover:border-white/25"
      } ${
        isMaximized
          ? "fixed inset-4 sm:inset-16 z-50 w-auto h-auto shadow-[0_0_80px_rgba(0,0,0,0.95)]"
          : sizeClasses
      }`}
    >
      {/* Video Feed */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isSelf ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#141210] p-4">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#221c16] border border-[#3b3124] flex items-center justify-center font-medium text-base text-[#ede7df] shadow-inner"
          >
            {participant.avatar || participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Top Right Maximize Button */}
      <button
        onClick={() => setIsMaximized(!isMaximized)}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-stone-300 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity border border-white/10 z-10 cursor-pointer"
        title={isMaximized ? "Tamanho Padrão" : "Expandir Câmera"}
      >
        {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>

      {/* Bottom Name & Mic Badge */}
      <div className="absolute bottom-2 left-2 right-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#0e0c0b]/85 border border-white/10 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[11px] sm:text-xs font-medium text-[#ede7df] truncate max-w-[110px] sm:max-w-[140px]">
            {participant.name} {isSelf && "(Você)"}
          </span>
          {participant.isSpeaking && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          )}
        </div>

        <div className="flex items-center">
          {participant.isAudioEnabled ? (
            <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
          ) : (
            <MicOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export function LeftCameraDock({
  participants,
  currentUserId,
  isCinemaMode,
  localStream,
  remoteCamStreams,
  onInviteClick,
}: LeftCameraDockProps) {
  const [gridSize, setGridSize] = useState<CamGridSize>("md");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasAnyCamera = participants.some(
    (p) => p.isVideoEnabled && (p.id === currentUserId ? !!localStream : !!remoteCamStreams.get(p.id))
  );

  return (
    <div
      className={`fixed left-2 sm:left-6 top-16 sm:top-20 z-30 transition-all duration-500 flex flex-col items-start ${
        isCinemaMode ? "opacity-75 hover:opacity-100" : "opacity-100"
      }`}
    >
      {/* Mobile Collapse / Expand Trigger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="sm:hidden mb-2 px-3 py-1.5 rounded-xl bg-[#14110f]/95 border border-white/10 text-xs text-[#ede7df] shadow-lg flex items-center gap-2 backdrop-blur-md active:scale-95 cursor-pointer"
      >
        <Users className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-medium text-[11px]">
          {isMobileOpen ? "Ocultar Câmeras" : `Câmeras (${participants.length})`}
        </span>
        {hasAnyCamera && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>

      {/* Dock Container (Always visible on desktop, togglable on mobile) */}
      <div
        className={`flex flex-col gap-2.5 sm:gap-3 bg-[#120f0d]/90 backdrop-blur-2xl p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[75vh] sm:max-h-[82vh] overflow-y-auto scrollbar-thin transition-all duration-300 ${
          isMobileOpen ? "flex" : "hidden sm:flex"
        }`}
      >
        {/* Dock Controls Header (Size adjustment & close on mobile) */}
        <div className="flex items-center justify-between w-full px-1.5 pb-1 border-b border-white/[0.06] text-[10px] text-stone-400 gap-2">
          <span className="font-mono text-[10px] text-stone-300 uppercase tracking-wider font-medium">
            Presença ({participants.length})
          </span>

          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setGridSize("sm")}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                gridSize === "sm" ? "bg-amber-400 text-stone-950 font-bold" : "text-stone-400 hover:text-white"
              }`}
              title="Pequeno"
            >
              P
            </button>
            <button
              onClick={() => setGridSize("md")}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                gridSize === "md" ? "bg-amber-400 text-stone-950 font-bold" : "text-stone-400 hover:text-white"
              }`}
              title="Médio"
            >
              M
            </button>
            <button
              onClick={() => setGridSize("lg")}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                gridSize === "lg" ? "bg-amber-400 text-stone-950 font-bold" : "text-stone-400 hover:text-white"
              }`}
              title="Grande"
            >
              G
            </button>
          </div>
        </div>

        {/* Video Cards / Avatars List */}
        <div className="flex flex-col gap-3">
          {participants.map((p) => {
            const isMe = p.id === currentUserId;
            const stream = isMe ? (p.isVideoEnabled ? localStream : null) : (remoteCamStreams.get(p.id) || null);

            // If camera is enabled, render the Left Feed Card
            if (p.isVideoEnabled && stream) {
              return (
                <CameraFeedCard
                  key={p.id}
                  participant={p}
                  isSelf={isMe}
                  stream={stream}
                  size={gridSize}
                />
              );
            }

            // Otherwise show a generous, quiet presence slot
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-[#14110f] border transition-all duration-300 ${
                  p.isSpeaking
                    ? "border-amber-400/70"
                    : "border-white/[0.07]"
                } ${
                  gridSize === "sm"
                    ? "w-60 sm:w-64"
                    : gridSize === "md"
                    ? "w-72 sm:w-80"
                    : "w-88 sm:w-96"
                }`}
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#221c16] border border-[#3b3124] flex items-center justify-center font-medium text-sm text-[#ede7df]"
                  >
                    {p.avatar || p.name.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#14110f] bg-[#0c0a09]"
                  >
                    {p.isAudioEnabled ? (
                      <Mic className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <MicOff className="w-2.5 h-2.5 text-rose-400" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-[#ede7df] truncate">
                    {p.name} {isMe && "(Você)"}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {p.isSpeaking ? "falando..." : "presente no espaço"}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Invite Button if room has space */}
          {participants.length < 4 && (
            <button
              onClick={onInviteClick}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-dashed border-white/10 hover:border-amber-400/40 hover:bg-white/[0.03] text-stone-400 hover:text-amber-200 transition-all text-xs cursor-pointer ${
                gridSize === "sm"
                  ? "w-60 sm:w-64"
                  : gridSize === "md"
                  ? "w-72 sm:w-80"
                  : "w-88 sm:w-96"
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Convidar alguém</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
