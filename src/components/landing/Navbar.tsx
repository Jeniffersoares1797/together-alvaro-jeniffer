"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";

interface NavbarProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
  onMemoriesClick: () => void;
}

export function Navbar({ onCreateClick, onJoinClick, onMemoriesClick }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-5 transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif italic font-normal text-2xl tracking-tight text-[#ede7df] group-hover:text-amber-200 transition-colors">
            together<span className="text-amber-400">.</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onMemoriesClick}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-[#ede7df] transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400/70" />
            <span>Nossos Momentos</span>
          </button>

          <button
            onClick={onJoinClick}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
          >
            Entrar em uma sala
          </button>

          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-stone-950" />
            <span>Criar nosso lugar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
