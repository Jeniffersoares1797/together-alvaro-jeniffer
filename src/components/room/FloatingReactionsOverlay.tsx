"use client";

import { FloatingReaction } from "@/types";

interface FloatingReactionsOverlayProps {
  reactions: FloatingReaction[];
}

export function FloatingReactionsOverlay({ reactions }: FloatingReactionsOverlayProps) {
  if (reactions.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 pointer-events-none z-30 flex flex-col-reverse items-end gap-2 overflow-hidden max-h-80 w-44">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="animate-float-up flex items-center gap-2 select-none bg-stone-950/80 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-xl"
        >
          <span className="text-xl sm:text-2xl filter drop-shadow">
            {r.emoji}
          </span>
          <span className="text-[11px] font-medium text-amber-200/90 font-mono">
            Você
          </span>
        </div>
      ))}
    </div>
  );
}
