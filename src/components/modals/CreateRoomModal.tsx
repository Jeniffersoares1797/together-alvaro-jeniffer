"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, ArrowRight, Warehouse, TreePine, Navigation, Moon } from "lucide-react";
import { EnvironmentId } from "@/types";
import { ENVIRONMENTS_LIST } from "@/lib/data/environments";

const ENV_ICONS: Record<string, any> = {
  "garagem": Warehouse,
  "cabana": TreePine,
  "estrada": Navigation,
  "quarto": Moon,
};

const COUPLE_PROFILES = [
  {
    name: "Alvaro",
    avatar: "A",
    color: "bg-[#2b2219] text-amber-300 border-[#4a3a2a]",
    accent: "text-amber-400",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  },
  {
    name: "Jeniffer",
    avatar: "J",
    color: "bg-[#2e1c18] text-rose-300 border-[#4a2e27]",
    accent: "text-rose-400",
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-200",
  },
];

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEnvId?: EnvironmentId;
}

export function CreateRoomModal({ isOpen, onClose, defaultEnvId = "garagem" }: CreateRoomModalProps) {
  const router = useRouter();
  const [roomName, setRoomName] = useState("Lugar de Alvaro & Jeniffer");
  const [selectedProfile, setSelectedProfile] = useState<string>("Alvaro");
  const [customName, setCustomName] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentId>(defaultEnvId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentName = selectedProfile === "other" ? customName.trim() : selectedProfile;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName) return;

    setIsSubmitting(true);
    const roomId = `room-${Math.random().toString(36).substring(2, 8)}`;

    const profileObj = COUPLE_PROFILES.find((p) => p.name === selectedProfile);
    const userColor = profileObj ? profileObj.color : "bg-[#1f242e] text-blue-300 border-[#323d4f]";
    const userAvatar = currentName.charAt(0).toUpperCase();

    if (typeof window !== "undefined") {
      localStorage.setItem(`together_user_${roomId}`, JSON.stringify({
        name: currentName,
        color: userColor,
        avatar: userAvatar,
        isHost: true,
      }));
      localStorage.setItem(`together_env_${roomId}`, selectedEnv);
      localStorage.setItem(`together_name_${roomId}`, roomName.trim() || "Nosso Lugar");
    }

    router.push(`/room/${roomId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#120f0d] border border-white/[0.08] shadow-2xl p-6 sm:p-7 text-[#ede7df]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-medium text-[#ede7df]">
            Criar nosso lugar
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Escolha quem está entrando e o ambiente para passarmos tempo juntos.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Couple Name Selector (Alvaro / Jeniffer / Outro) */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Quem é você?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {COUPLE_PROFILES.map((profile) => {
                const isSelected = selectedProfile === profile.name;
                return (
                  <button
                    key={profile.name}
                    type="button"
                    onClick={() => setSelectedProfile(profile.name)}
                    className={`px-3 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${profile.badge} shadow-sm font-semibold`
                        : "bg-[#090807] border-white/10 text-stone-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-xs font-bold font-mono">
                      {profile.avatar}
                    </span>
                    <span className="text-xs">{profile.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedProfile("other")}
                className={`px-3 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs ${
                  selectedProfile === "other"
                    ? "border-amber-400/50 bg-amber-400/15 text-amber-200 font-semibold"
                    : "bg-[#090807] border-white/10 text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Outro</span>
              </button>
            </div>

            {selectedProfile === "other" && (
              <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Digite seu nome..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090807] border border-amber-400/40 text-xs text-[#ede7df] placeholder:text-stone-600 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Room Name Input */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Nome do Nosso Espaço
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Ex: Lugar de Alvaro & Jeniffer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090807] border border-white/10 text-xs text-[#ede7df] placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
          </div>

          {/* Environment Selection */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2">
              Lugar Inicial
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ENVIRONMENTS_LIST.map((env) => {
                const Icon = ENV_ICONS[env.id] || Warehouse;
                const isSelected = selectedEnv === env.id;
                return (
                  <button
                    type="button"
                    key={env.id}
                    onClick={() => setSelectedEnv(env.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-400/15 border-amber-400/40 text-[#ede7df]"
                        : "bg-[#0c0a09] border-white/5 hover:border-white/15 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-amber-300" : "text-stone-500"}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#ede7df]">
                        {env.name}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                        {env.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !currentName}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
            >
              <span>{isSubmitting ? "Entrando..." : "Entrar no nosso lugar"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
