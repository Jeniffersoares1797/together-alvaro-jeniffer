"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Maximize2, Minimize2, Play, Film, Volume2, VolumeX } from "lucide-react";

interface VirtualTVProps {
  screenStream: MediaStream | null;
  isScreenSharingByMe: boolean;
  screenSharerName?: string;
  onStopScreenShare: () => void;
  videoUrl?: string;
  videoTitle?: string;
  isCinemaMode: boolean;
  isLampOn?: boolean;
  onToggleCinemaMode: () => void;
  onOpenWatchModal: () => void;
  environmentThemeColor: string;
}

export function VirtualTV({
  screenStream,
  isScreenSharingByMe,
  screenSharerName,
  onStopScreenShare,
  videoUrl,
  videoTitle,
  isCinemaMode,
  isLampOn = true,
  onToggleCinemaMode,
  onOpenWatchModal,
}: VirtualTVProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasActiveMedia = !!(screenStream || videoUrl);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
      videoRef.current.muted = isScreenSharingByMe || isAudioMuted;
      videoRef.current.play().catch((err) => {
        console.warn("Video auto-play warning:", err);
      });
    }
  }, [screenStream, isScreenSharingByMe, isAudioMuted]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleAudioMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsAudioMuted(nextMuted);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-700 ease-out z-20 mx-auto flex flex-col items-center justify-center ${
        isCinemaMode
          ? "w-full max-w-7xl h-[80vh] sm:h-[86vh] md:h-[90vh] -mt-6"
          : hasActiveMedia
          ? "w-full max-w-5xl xl:max-w-6xl h-[62vh] sm:h-[70vh] md:h-[74vh] -mt-2"
          : "w-full max-w-2xl sm:max-w-3xl h-[40vh] sm:h-[46vh]"
      }`}
    >
      {/* ========================================================================= */}
      {/* CINEMATIC PROJECTION LIGHT BEAM (Shines brightly when room light is off)   */}
      {/* ========================================================================= */}
      {!isLampOn && (
        <>
          {/* 1. Large Wall Ambient Glow behind TV */}
          <div className="absolute -inset-10 sm:-inset-16 bg-gradient-to-t from-amber-400/20 via-sky-300/15 to-transparent rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 opacity-90 animate-pulse" />
          
          {/* 2. Top Projector Cone Light shining up onto the back wall */}
          <div className="absolute -top-24 sm:-top-36 inset-x-8 h-40 bg-gradient-to-t from-white/15 via-amber-200/10 to-transparent blur-2xl pointer-events-none" />

          {/* 3. Floor Ambient Screen Reflection */}
          <div className="absolute -bottom-16 inset-x-12 h-28 bg-gradient-to-b from-amber-400/25 via-sky-400/10 to-transparent blur-2xl pointer-events-none" />
        </>
      )}

      {/* Physical TV Chassis Frame (Matte Black Bezel on Console) */}
      <div
        className={`relative w-full h-full rounded-2xl bg-[#090807] border overflow-hidden flex flex-col justify-between group transition-all duration-700 ${
          !isLampOn
            ? "border-amber-400/30 shadow-[0_0_90px_rgba(245,158,11,0.22),0_40px_100px_rgba(0,0,0,0.98)]"
            : "border-[#2b2622] shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
        }`}
      >
        {/* Top Status (Transmission Pill) */}
        {isScreenSharingByMe ? (
          <div className="absolute top-3.5 left-4 z-30 flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1e1913] text-amber-300 text-xs border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Transmitindo tela + áudio</span>
            <button
              onClick={onStopScreenShare}
              className="ml-2 px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-semibold transition-all hover:bg-amber-300 cursor-pointer"
            >
              Parar
            </button>
          </div>
        ) : screenStream ? (
          <div className="absolute top-3.5 left-4 z-30 flex items-center gap-2 px-3 py-1 rounded-lg bg-[#141210] text-stone-300 text-xs border border-white/10">
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>{screenSharerName || "Participante"} transmitindo</span>
          </div>
        ) : null}

        {/* Top Right Action Controls */}
        <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#141210]/90 p-1.5 rounded-lg border border-white/10">
          {screenStream && !isScreenSharingByMe && (
            <button
              onClick={handleToggleAudioMute}
              className="p-1.5 rounded text-xs text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isAudioMuted ? "Ativar Áudio da Transmissão" : "Silenciar Áudio"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            </button>
          )}
          <button
            onClick={onToggleCinemaMode}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              isCinemaMode
                ? "bg-amber-400 text-stone-950 font-bold"
                : "text-stone-300 hover:text-white hover:bg-white/10"
            }`}
            title={isCinemaMode ? "Sair do Modo Cinema" : "Modo Cinema"}
          >
            <Film className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded text-xs text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? "Tela Normal" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Screen Central Content Container */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {/* Mode 1: Screen Share Stream */}
          {screenStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain max-h-full"
            />
          ) : videoUrl ? (
            /* Mode 2: Embedded Watch Video (YouTube / Direct) */
            <div className="w-full h-full relative flex items-center justify-center">
              <iframe
                src={videoUrl}
                title={videoTitle || "Vídeo"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          ) : (
            /* Mode 3: Standby Screen */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#0a0908]">
              <div className="w-12 h-12 rounded-xl bg-[#171411] border border-[#2b251e] flex items-center justify-center text-amber-300/80 mb-3 shadow-sm">
                <Film className="w-5 h-5" />
              </div>

              <h4 className="text-sm font-medium text-[#ede7df] mb-1">
                Televisão da Sala
              </h4>
              <p className="text-xs text-stone-400 max-w-sm mb-5">
                Transmitam a tela do computador ou colem um link para assistirem juntos.
              </p>

              <button
                onClick={onOpenWatchModal}
                className="px-4 py-2 rounded-xl bg-[#1e1913] hover:bg-[#28221a] border border-[#3b3124] text-amber-200 text-xs font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Vamos assistir algo?</span>
              </button>
            </div>
          )}
        </div>

        {/* Minimalist Dark Console Base (Hidden when large or in cinema mode) */}
        {!isCinemaMode && !hasActiveMedia && (
          <div className="w-24 h-1.5 bg-[#1e1a16] mx-auto rounded-full shadow-inner" />
        )}
      </div>
    </div>
  );
}
