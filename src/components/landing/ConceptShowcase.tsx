"use client";

import { ArrowRight, Warehouse, TreePine, Navigation, Moon } from "lucide-react";
import { ENVIRONMENTS_LIST } from "@/lib/data/environments";

const ENV_ICONS: Record<string, any> = {
  "garagem": Warehouse,
  "cabana": TreePine,
  "estrada": Navigation,
  "quarto": Moon,
};

interface ConceptShowcaseProps {
  onCreateWithEnv: (envId: string) => void;
}

export function ConceptShowcase({ onCreateWithEnv }: ConceptShowcaseProps) {
  return (
    <section className="py-24 px-6 relative border-t border-white/[0.04] bg-[#090807]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-light text-[#ede7df] tracking-tight mb-3">
            Quatro lugares para estar.
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Cada ambiente foi desenhado como um espaço real: com iluminação quente, chuva no vidro, textura e silêncio.
          </p>
        </div>

        {/* 4 Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ENVIRONMENTS_LIST.map((env) => {
            const IconComponent = ENV_ICONS[env.id] || Warehouse;
            return (
              <div
                key={env.id}
                className="group relative rounded-2xl p-6 bg-[#120f0d] border border-white/[0.07] hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1c1713] border border-[#2e241c] flex items-center justify-center text-amber-300/80">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                      Ambiente real
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-[#ede7df] mb-1">
                    {env.name}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-normal mb-3">
                    {env.tagline}
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed mb-6 font-normal">
                    {env.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 font-mono">
                    Chuva & som natural
                  </span>

                  <button
                    onClick={() => onCreateWithEnv(env.id)}
                    className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Entrar nesta sala</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
