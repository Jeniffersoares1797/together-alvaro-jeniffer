"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Crown, Monitor, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { Participant } from "@/types";

interface ParticipantsPresenceProps {
  participants: Participant[];
  currentUserId: string;
  isCinemaMode: boolean;
  localStream: MediaStream | null;
  remoteCamStreams: Map<string, MediaStream>;
  onInviteClick: () => void;
}

function ParticipantVideoCard({
  stream,
  isSelf,
  participant,
  isCinemaMode,
}: {
  stream: MediaStream | null;
  isSelf: boolean;
  participant: Participant;
  isCinemaMode: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = isSelf; // Mute self to prevent feedback
      videoRef.current.play().catch((err) => {
        console.warn("Camera auto-play:", err);
      });
    }
  }, [stream, isSelf]);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-stone-950 border transition-all duration-500 shadow-2xl group ${
        participant.isSpeaking
          ? "border-amber-400/90 shadow-[0_0_35px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/60"
          : "border-white/[0.12] hover:border-amber-400/30"
      } ${
        isExpanded
          ? "fixed inset-8 sm:inset-16 z-50 w-auto h-auto"
          : isCinemaMode
          ? "w-48 sm:w-60 md:w-72 h-32 sm:h-40 md:h-48"
          : "w-60 sm:w-72 md:w-84 lg:w-96 h-40 sm:h-48 md:h-56 lg:h-64"
      }`}
    >
      {/* Video Element (Full HD Crystal Clear) */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isSelf ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900/90 p-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${participant.color || "from-amber-600 to-amber-500"} flex items-center justify-center font-bold text-lg text-stone-950 shadow-inner`}
          >
            {participant.avatar || participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Top Left Host Crown */}
      {participant.isHost && (
        <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-stone-950 shadow-md z-10">
          <Crown className="w-3 h-3 fill-stone-950" />
        </div>
      )}

      {/* Top Right Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-stone-300 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10 cursor-pointer"
        title={isExpanded ? "Reduzir Câmera" : "Expandir Câmera"}
      >
        {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>

      {/* Subtle Bottom Ambient Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

      {/* Bottom Name & Mic Badge */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-2xl bg-stone-950/80 backdrop-blur-xl border border-white/10 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-semibold text-[#f6f0e8] truncate">
            {participant.name} {isSelf && "(Você)"}
          </span>
          {participant.isSpeaking && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {participant.isAudioEnabled ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Mic className="w-3 h-3" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <MicOff className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParticipantsPresence({
  participants,
  currentUserId,
  isCinemaMode,
  localStream,
  remoteCamStreams,
  onInviteClick,
}: ParticipantsPresenceProps) {
  const hasAnyCamera = participants.some((p) => {
    const isMe = p.id === currentUserId;
    return isMe ? (p.isVideoEnabled && !!localStream) : (p.isVideoEnabled && remoteCamStreams.has(p.id));
  });

  return (
    <div
      className={`w-full max-w-6xl mx-auto flex items-center justify-center px-4 sm:px-8 transition-all duration-700 z-20 ${
        isCinemaMode
          ? "opacity-35 hover:opacity-100 py-2"
          : "opacity-100 py-4"
      }`}
    >
      {/* Participants Video Feeds / Avatars Container */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
        {participants.map((p) => {
          const isMe = p.id === currentUserId;
          const stream = isMe ? (p.isVideoEnabled ? localStream : null) : (remoteCamStreams.get(p.id) || null);

          // If camera is enabled, render the expanded luxury Video Card
          if (p.isVideoEnabled && stream) {
            return (
              <ParticipantVideoCard
                key={p.id}
                participant={p}
                isSelf={isMe}
                stream={stream}
                isCinemaMode={isCinemaMode}
              />
            );
          }

          // Otherwise show the classic integrated avatar badge
          return (
            <div
              key={p.id}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl glass-panel transition-all duration-300 ${
                p.isSpeaking
                  ? "border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-[1.02]"
                  : "border-white/[0.08]"
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-tr ${p.color || "from-amber-600 to-amber-500"} flex items-center justify-center font-bold text-sm text-stone-950 shadow-inner transition-transform ${
                    p.isSpeaking ? "ring-4 ring-amber-400/50 scale-105" : ""
                  }`}
                >
                  {p.avatar || p.name.charAt(0).toUpperCase()}
                </div>

                {/* Host Crown */}
                {p.isHost && (
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-stone-950 shadow-sm">
                    <Crown className="w-2.5 h-2.5 fill-stone-950" />
                  </div>
                )}

                {/* Mic Indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-stone-950 ${
                    p.isAudioEnabled ? "bg-emerald-500 text-stone-950" : "bg-stone-700 text-stone-300"
                  }`}
                >
                  {p.isAudioEnabled ? (
                    <Mic className="w-2.5 h-2.5" />
                  ) : (
                    <MicOff className="w-2.5 h-2.5 text-rose-400" />
                  )}
                </div>
              </div>

              {/* Name & Status */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#f6f0e8]">
                    {p.name} {isMe && "(Você)"}
                  </span>
                  {p.isScreenSharing && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[9px] font-mono flex items-center gap-0.5">
                      <Monitor className="w-2.5 h-2.5" /> Tela
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {p.isSpeaking ? "Falando..." : "Na sala"}
                </span>
              </div>
            </div>
          );
        })}

        {/* Quick Invite Seat */}
        {participants.length < 4 && !hasAnyCamera && (
          <button
            onClick={onInviteClick}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-dashed border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10 text-amber-300/80 hover:text-amber-200 transition-all text-xs font-medium group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span>+ Chamar Alguém</span>
          </button>
        )}
      </div>
    </div>
  );
}
