"use client";

import { useState } from "react";
import { X, Play, Film, Video } from "lucide-react";

interface WatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetVideoUrl: (url: string, title: string) => void;
}

const PRESET_STREAMS = [
  {
    title: "Lofi Hip Hop Chill Beats — Estudo & Relax",
    url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&enablejsapi=1&rel=0",
    tag: "Música & Aconchego",
  },
  {
    title: "Lareira Crepitante 4K em Chalé de Madeira",
    url: "https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&enablejsapi=1&rel=0",
    tag: "Visual & Som Natural",
  },
  {
    title: "Passeio Noturno sob Chuva Leve",
    url: "https://www.youtube.com/embed/gL8m4q7Q7XU?autoplay=1&enablejsapi=1&rel=0",
    tag: "Cinematográfico",
  },
  {
    title: "Studio Ghibli Piano Melodies — Trilha Calma",
    url: "https://www.youtube.com/embed/DEqXN9556P0?autoplay=1&enablejsapi=1&rel=0",
    tag: "Nostalgia & Paz",
  },
];

export function WatchModal({ isOpen, onClose, onSetVideoUrl }: WatchModalProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const parseVideoUrl = (raw: string): { embedUrl: string; title: string } | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    if (trimmed.endsWith(".mp4") || trimmed.endsWith(".webm")) {
      return { embedUrl: trimmed, title: "Vídeo Direto" };
    }

    if (trimmed.includes("youtube.com/shorts/")) {
      const parts = trimmed.split("shorts/")[1].split("?")[0].replace("/", "");
      return {
        embedUrl: `https://www.youtube.com/embed/${parts}?autoplay=1&enablejsapi=1&rel=0`,
        title: "YouTube Shorts",
      };
    }

    if (trimmed.includes("youtube.com/watch")) {
      const urlObj = new URL(trimmed);
      const v = urlObj.searchParams.get("v");
      if (v) {
        return {
          embedUrl: `https://www.youtube.com/embed/${v}?autoplay=1&enablejsapi=1&rel=0`,
          title: "Vídeo do YouTube",
        };
      }
    }

    if (trimmed.includes("youtu.be/")) {
      const id = trimmed.split("youtu.be/")[1].split("?")[0].replace("/", "");
      if (id) {
        return {
          embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0`,
          title: "Vídeo do YouTube",
        };
      }
    }

    if (trimmed.includes("youtube.com/embed/")) {
      return {
        embedUrl: trimmed.includes("autoplay=1") ? trimmed : `${trimmed}?autoplay=1&enablejsapi=1&rel=0`,
        title: "Vídeo do YouTube",
      };
    }

    return {
      embedUrl: trimmed,
      title: "Mídia Compartilhada",
    };
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsed = parseVideoUrl(customUrl);
    if (!parsed) {
      setErrorMsg("Por favor, insira um link válido do YouTube ou de vídeo.");
      return;
    }

    onSetVideoUrl(parsed.embedUrl, parsed.title);
    setCustomUrl("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#120f0d] border border-white/[0.08] shadow-2xl p-6 sm:p-7 text-[#ede7df]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1a1613] border border-[#2d241c] flex items-center justify-center text-amber-300">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#ede7df]">
              Assistir Juntos na TV
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              O vídeo e áudio serão sincronizados para nós na sala.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Custom URL Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-300">
              <Video className="w-3.5 h-3.5 text-stone-400" />
              Cole um Link do YouTube ou Vídeo Direto
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="https://youtube.com/watch?v=... ou youtu.be/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090807] border border-white/10 text-xs text-[#ede7df] placeholder:text-stone-600 focus:outline-none focus:border-amber-400/50"
              />
              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 text-xs font-semibold shrink-0 cursor-pointer shadow-sm transition-all"
              >
                Espelhar
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>
            )}
          </form>

          {/* Quick Curated Streams */}
          <div className="pt-2">
            <div className="text-xs font-medium text-stone-400 mb-2.5 font-mono uppercase tracking-wider text-[10px]">
              Sugestões Rápidas de Transmissão
            </div>

            <div className="space-y-2">
              {PRESET_STREAMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSetVideoUrl(item.url, item.title);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-[#0c0a09] border border-white/5 hover:border-white/15 text-left flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-[#ede7df] group-hover:text-amber-200">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      {item.tag}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#1a1612] border border-[#2d241c] flex items-center justify-center text-amber-300 shrink-0">
                    <Play className="w-3 h-3 fill-amber-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
