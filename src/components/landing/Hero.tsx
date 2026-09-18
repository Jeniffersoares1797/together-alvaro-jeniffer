"use client";

import { ArrowRight } from "lucide-react";

interface HeroProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export function Hero({ onCreateClick, onJoinClick }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] pt-32 pb-16 px-6 flex flex-col items-center justify-center overflow-hidden bg-[#090807]">
      {/* Soft Ambient Depth */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: "rgba(217, 119, 6, 0.25)" }}
      />
      
      <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Simple Grounded Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#ede7df] leading-[1.12] mb-10">
          Mesmo longe, <br />
          <span className="font-serif italic text-amber-200">
            nós temos um lugar.
          </span>
        </h1>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={onCreateClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 shadow-sm transition-all cursor-pointer"
          >
            <span>Criar nosso lugar</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
          </button>

          <button
            onClick={onJoinClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-medium text-[#ede7df] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
          >
            Entrar em uma sala
          </button>
        </div>
      </div>
    </section>
  );
}
