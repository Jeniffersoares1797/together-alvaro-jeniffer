

"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Maximize2, Minimize2, Plus } from "lucide-react";
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
    sm: "w-60 h-40 sm:w-64 sm:h-44",
    md: "w-72 h-48 sm:w-80 sm:h-54",
    lg: "w-88 h-60 sm:w-96 sm:h-66",
  }[size];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#0a0908] border transition-all duration-300 shadow-2xl group ${
        participant.isSpeaking
          ? "border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40"
          : "border-white/[0.09] hover:border-white/25"
      } ${
        isMaximized
          ? "fixed inset-8 sm:inset-16 z-50 w-auto h-auto shadow-[0_0_80px_rgba(0,0,0,0.95)]"
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
            className="w-14 h-14 rounded-2xl bg-[#221c16] border border-[#3b3124] flex items-center justify-center font-medium text-base text-[#ede7df] shadow-inner"
          >
            {participant.avatar || participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Top Right Maximize Button */}
      <button
        onClick={() => setIsMaximized(!isMaximized)}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-stone-300 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10 cursor-pointer"
        title={isMaximized ? "Tamanho Padrão" : "Expandir Câmera"}
      >
        {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>

      {/* Bottom Name & Mic Badge */}
      <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-[#0e0c0b]/85 border border-white/10 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-medium text-[#ede7df] truncate max-w-[140px]">
            {participant.name} {isSelf && "(Você)"}
          </span>
          {participant.isSpeaking && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>

        <div className="flex items-center">
          {participant.isAudioEnabled ? (
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-rose-400" />
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

  return (
    <div
      className={`fixed left-4 sm:left-6 top-18 sm:top-20 z-30 transition-all duration-500 flex flex-col items-start ${
        isCinemaMode ? "opacity-75 hover:opacity-100" : "opacity-100"
      }`}
    >
      {/* Dock Container */}
      <div className="flex flex-col gap-3 bg-[#120f0d]/85 backdrop-blur-2xl p-3 rounded-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[82vh] overflow-y-auto scrollbar-thin">
        {/* Dock Controls Header (Size adjustment) */}
        <div className="flex items-center justify-between w-full px-1.5 pb-1 border-b border-white/[0.06] text-[10px] text-stone-400 gap-2">
          <span className="font-mono text-[10px] text-stone-300 uppercase tracking-wider font-medium">
            Presença ({participants.length})
          </span>

          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setGridSize("sm")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                gridSize === "sm" ? "bg-amber-400 text-stone-950 font-bold" : "text-stone-400 hover:text-white"
              }`}
              title="Pequeno"
            >
              P
            </button>
            <button
              onClick={() => setGridSize("md")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                gridSize === "md" ? "bg-amber-400 text-stone-950 font-bold" : "text-stone-400 hover:text-white"
              }`}
              title="Médio"
            >
              M
            </button>
            <button
              onClick={() => setGridSize("lg")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
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
