"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Camera, ChevronDown, Check, Warehouse, TreePine, Navigation, Moon, SunMedium } from "lucide-react";
import { EnvironmentId } from "@/types";
import { ENVIRONMENTS, ENVIRONMENTS_LIST } from "@/lib/data/environments";

const ENV_ICONS: Record<string, any> = {
  "garagem": Warehouse,
  "cabana": TreePine,
  "estrada": Navigation,
  "quarto": Moon,
};

interface RoomHeaderProps {
  roomId: string;
  roomName: string;
  environmentId: EnvironmentId;
  onChangeEnvironment: (envId: EnvironmentId) => void;
  onInviteClick: () => void;
  onSaveMomentClick: () => void;
  isLampOn: boolean;
  onToggleLamp: () => void;
  isCinemaMode: boolean;
}

export function RoomHeader({
  roomName,
  environmentId,
  onChangeEnvironment,
  onInviteClick,
  onSaveMomentClick,
  isLampOn,
  onToggleLamp,
  isCinemaMode,
}: RoomHeaderProps) {
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const currentEnv = ENVIRONMENTS[environmentId] || ENVIRONMENTS["garagem"];
  const CurrentIcon = ENV_ICONS[environmentId] || Warehouse;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3 transition-all duration-500 ${
        isCinemaMode ? "opacity-20 hover:opacity-100" : "opacity-100"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Brand & Room Name & Environment Dropdown */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group text-stone-400 hover:text-[#ede7df] transition-colors"
            title="Voltar ao início"
          >
            <span className="font-serif italic font-normal text-lg tracking-tight text-[#ede7df]">
              together<span className="text-amber-400">.</span>
            </span>
          </Link>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <div className="relative">
            <button
              onClick={() => setShowEnvMenu(!showEnvMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141210]/90 border border-white/[0.08] hover:border-amber-400/40 transition-all text-left group cursor-pointer"
            >
              <CurrentIcon className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#ede7df]">
                    {roomName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-amber-300 transition-colors" />
                </div>
                <span className="text-[10px] text-stone-400 -mt-0.5">
                  {currentEnv.name}
                </span>
              </div>
            </button>

            {/* Environment Dropdown Menu */}
            {showEnvMenu && (
              <div className="absolute top-12 left-0 w-60 rounded-xl bg-[#14110f] border border-[#2b251e] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] uppercase font-mono tracking-wider text-stone-500 px-2.5 py-1">
                  Mudar Lugar
                </div>
                {ENVIRONMENTS_LIST.map((e) => {
                  const EnvIcon = ENV_ICONS[e.id] || Warehouse;
                  const isSelected = e.id === environmentId;
                  return (
                    <button
                      key={e.id}
                      onClick={() => {
                        onChangeEnvironment(e.id);
                        setShowEnvMenu(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 text-amber-200 font-medium"
                          : "text-stone-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <EnvIcon className="w-3.5 h-3.5 text-amber-400/80" />
                        <span>{e.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions (Luz da Sala, Convidar & Guardar Momento) */}
        <div className="flex items-center gap-2">
          {/* Light Toggle Switch */}
          <button
            onClick={onToggleLamp}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer text-xs font-medium ${
              isLampOn
                ? "bg-amber-500/15 border-amber-400/40 text-amber-200 hover:bg-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-[#141210]/90 border-white/[0.08] text-stone-400 hover:text-stone-200 hover:border-white/20"
            }`}
            title={isLampOn ? "Apagar a luz da sala (foco total na TV)" : "Acender a luz da sala"}
          >
            {isLampOn ? (
              <>
                <SunMedium className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Luz Acesa</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Luz Apagada</span>
              </>
            )}
          </button>

          <button
            onClick={onSaveMomentClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141210]/90 border border-white/[0.08] hover:border-rose-400/40 text-rose-300/90 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            title="Registrar lembrança deste momento"
          >
            <Camera className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Guardar Momento</span>
          </button>

          <button
            onClick={onInviteClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-stone-950" />
            <span>Convidar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
