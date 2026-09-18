"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";

const COUPLE_PROFILES = [
  {
    name: "Jeniffer",
    avatar: "J",
    color: "bg-[#2e1c18] text-rose-300 border-[#4a2e27]",
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-200",
  },
  {
    name: "Alvaro",
    avatar: "A",
    color: "bg-[#2b2219] text-amber-300 border-[#4a3a2a]",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  },
];

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [roomIdOrUrl, setRoomIdOrUrl] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<string>("Jeniffer");
  const [customName, setCustomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentName = selectedProfile === "other" ? customName.trim() : selectedProfile;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdOrUrl.trim() || !currentName) return;

    setIsSubmitting(true);
    let cleanId = roomIdOrUrl.trim();
    if (cleanId.includes("/room/")) {
      cleanId = cleanId.split("/room/")[1].split("?")[0].replace("/", "");
    }

    const profileObj = COUPLE_PROFILES.find((p) => p.name === selectedProfile);
    const userColor = profileObj ? profileObj.color : "bg-[#2e1c18] text-rose-300 border-[#4a2e27]";
    const userAvatar = currentName.charAt(0).toUpperCase();

    if (typeof window !== "undefined") {
      localStorage.setItem(`together_user_${cleanId}`, JSON.stringify({
        name: currentName,
        color: userColor,
        avatar: userAvatar,
        isHost: false,
      }));
    }

    router.push(`/room/${cleanId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#120f0d] border border-white/[0.08] shadow-2xl p-6 sm:p-7 text-[#ede7df]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-medium text-[#ede7df]">
            Entrar no nosso lugar
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Cole o link ou código compartilhado para estarmos juntos.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Código ou Link da Sala *
            </label>
            <input
              type="text"
              required
              value={roomIdOrUrl}
              onChange={(e) => setRoomIdOrUrl(e.target.value)}
              placeholder="Ex: room-abc123 ou o link completo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090807] border border-white/10 text-xs text-[#ede7df] placeholder:text-stone-600 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
          </div>

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
                    className={`px-3 py-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
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
                  placeholder="Como quer ser chamado(a)?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090807] border border-amber-400/40 text-xs text-[#ede7df] placeholder:text-stone-600 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !roomIdOrUrl.trim() || !currentName}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
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
