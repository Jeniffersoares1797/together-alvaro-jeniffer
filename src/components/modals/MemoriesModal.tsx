"use client";

import { useState } from "react";
import { X, Heart, Sparkles, Calendar, Clock, Users, Plus, Trash2, Camera } from "lucide-react";
import { Memory } from "@/types";

interface MemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onSaveNewMemory: (title: string, note: string) => void;
  onDeleteMemory: (id: string) => void;
  currentRoomName: string;
  currentEnvName: string;
  participants: string[];
}

export function MemoriesModal({
  isOpen,
  onClose,
  memories,
  onSaveNewMemory,
  onDeleteMemory,
  currentRoomName,
  currentEnvName,
  participants,
}: MemoriesModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [momentTitle, setMomentTitle] = useState("");
  const [momentNote, setMomentNote] = useState("");

  if (!isOpen) return null;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentTitle.trim()) return;
    onSaveNewMemory(momentTitle.trim(), momentNote.trim());
    setMomentTitle("");
    setMomentNote("");
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-amber-500/20 shadow-2xl p-6 sm:p-8 overflow-hidden text-[#f4ede2] flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-400/30" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-[#f4ede2]">
                Nossos Momentos
              </h2>
              <p className="text-xs text-stone-400">
                Memórias e instantes especiais guardados no Together.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-stone-950" />
            <span>{showCreateForm ? "Ver Galeria" : "Guardar Momento"}</span>
          </button>
        </div>

        {/* Create Memory Sub-Form */}
        {showCreateForm ? (
          <form onSubmit={handleSaveSubmit} className="space-y-4 p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Registrando momento em {currentRoomName} ({currentEnvName})</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
                Título do Momento *
              </label>
              <input
                type="text"
                required
                value={momentTitle}
                onChange={(e) => setMomentTitle(e.target.value)}
                placeholder="Ex: Primeira noite no Together ou Conversando sobre o futuro"
                className="w-full px-4 py-3 rounded-2xl bg-stone-950 border border-white/10 text-xs text-[#f4ede2] placeholder:text-stone-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
                O que fez esse momento especial? (opcional)
              </label>
              <textarea
                rows={3}
                value={momentNote}
                onChange={(e) => setMomentNote(e.target.value)}
                placeholder="Ex: Rimos muito de memórias antigas enquanto a chuva caía..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-950 border border-white/10 text-xs text-[#f4ede2] placeholder:text-stone-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-stone-400">
                Presentes: {participants.join(", ")}
              </div>
              <button
                type="submit"
                disabled={!momentTitle.trim()}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-md"
              >
                Salvar na Galeria
              </button>
            </div>
          </form>
        ) : (
          /* Gallery List */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {memories.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-stone-500">
                <Heart className="w-8 h-8 text-rose-500/30 mb-2" />
                <p className="text-xs text-stone-400">Nenhum momento guardado ainda.</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Clique em &ldquo;Guardar Momento&rdquo; para registrar uma lembrança carinhosa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-4 rounded-2xl bg-stone-900/60 border border-white/[0.08] hover:border-amber-500/30 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top Date & Room */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 mb-2 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400/70" />
                          {mem.dateFormatted}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-500" />
                          {mem.timeFormatted}
                        </span>
                      </div>

                      <h3 className="text-sm font-medium text-[#f4ede2] mb-1.5 group-hover:text-amber-200 transition-colors">
                        {mem.title}
                      </h3>

                      {mem.note && (
                        <p className="text-xs text-stone-400 leading-relaxed italic mb-3">
                          &ldquo;{mem.note}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Bottom Info & Delete */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-stone-500">
                      <span className="truncate max-w-[140px]">
                        📍 {mem.environmentName}
                      </span>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-stone-500 hover:text-rose-400 transition-opacity"
                        title="Remover memória"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
