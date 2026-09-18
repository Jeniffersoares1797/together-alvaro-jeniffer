"use client";

import { useState } from "react";
import { X, Copy, Check, Users, Sparkles, Share2 } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

export function InviteModal({ isOpen, onClose, roomId, roomName }: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const roomUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${roomId}` : `/room/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-amber-500/20 shadow-2xl p-6 sm:p-8 text-[#f4ede2]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#f4ede2]">
              Convidar para {roomName}
            </h2>
            <p className="text-xs text-stone-400">
              Envie o link para quem você deseja ter por perto hoje.
            </p>
          </div>
        </div>

        {/* Link Copy Box */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-white/10 flex items-center justify-between gap-2">
            <div className="text-xs text-amber-200/90 truncate font-mono select-all">
              {roomUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 text-xs text-amber-100/80 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Quem abrir este link entrará automaticamente no mesmo ambiente virtual, sem necessidade de cadastros ou downloads.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-xs font-medium text-stone-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            Voltar à Sala
          </button>
        </div>
      </div>
    </div>
  );
}
