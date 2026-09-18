"use client";

import { Monitor, Heart, Film, MessageCircleHeart, Sparkles, ShieldCheck } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: Monitor,
      title: "Projeção na TV Central",
      description: "Compartilhe tela cheia, janela ou aba do navegador diretamente na TV do ambiente virtual. Sem telas divididas em mosaicos frios.",
      accent: "from-amber-500/20 to-orange-500/5",
      accentBorder: "border-amber-500/20",
    },
    {
      icon: Film,
      title: "Modo Cinema Imersivo",
      description: "Ao acionar o modo cinema, a iluminação ao redor diminui suavemente, a tela se expande e a experiência se torna cinematográfica.",
      accent: "from-rose-500/20 to-red-500/5",
      accentBorder: "border-rose-500/20",
    },
    {
      icon: Heart,
      title: "Nossos Momentos",
      description: "Guarde memórias com fotos virtuais, reflexões sinceras e atividades compartilhadas para reviver na sua galeria privada.",
      accent: "from-pink-500/20 to-rose-500/5",
      accentBorder: "border-pink-500/20",
    },
    {
      icon: Sparkles,
      title: "Atividades & Perguntas Profundas",
      description: "Deck de perguntas para estreitar os laços, votação de filmes para a noite e jogos simples para quebrar o silêncio da distância.",
      accent: "from-amber-400/20 to-yellow-500/5",
      accentBorder: "border-amber-400/20",
    },
    {
      icon: MessageCircleHeart,
      title: "Chat Discreto & Reações Flutuantes",
      description: "Envie recados, corações e risadas que flutuam organicamente pelo cômodo sem poluir a sua visualização.",
      accent: "from-indigo-500/20 to-purple-500/5",
      accentBorder: "border-indigo-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Privacidade & Sem Instalação",
      description: "Crie uma sala privada em segundos e convide quem você ama por link direto. Sem downloads ou logins obrigatórios.",
      accent: "from-emerald-500/20 to-teal-500/5",
      accentBorder: "border-emerald-500/20",
    },
  ];

  return (
    <section className="py-28 px-6 relative border-t border-white/[0.05] bg-black/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-5xl font-light text-[#f6f0e8] tracking-tight mb-4">
            Construído para conexão genuína.
          </h2>
          <p className="text-stone-400 text-sm sm:text-base">
            Cada detalhe foi desenhado para transformar a distância física em presença compartilhada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-7 rounded-3xl glass-panel border border-white/[0.06] hover:border-amber-400/25 transition-all duration-300 group hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} border ${f.accentBorder} flex items-center justify-center text-amber-300 mb-6 group-hover:scale-105 transition-transform shadow-inner`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-[#f6f0e8] mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed font-normal">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
