"use client";

import { useEffect, useRef } from "react";
import { EnvironmentId } from "@/types";
import { ENVIRONMENTS } from "@/lib/data/environments";

interface RoomSceneProps {
  environmentId: EnvironmentId;
  isLampOn: boolean;
  onToggleLamp: () => void;
  isCinemaMode: boolean;
  children: React.ReactNode;
}

export function RoomScene({
  environmentId,
  isLampOn,
  onToggleLamp,
  isCinemaMode,
  children,
}: RoomSceneProps) {
  const env = ENVIRONMENTS[environmentId] || ENVIRONMENTS["garagem"];
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);

  // Multi-layered Procedural Rain Canvas Simulation
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Raindrop particles with 3 depth layers (background, midground, foreground)
    interface RainDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
      width: number;
      slant: number;
      layer: "bg" | "mid" | "fg";
    }

    const raindrops: RainDrop[] = [];
    const count =
      environmentId === "estrada"
        ? 130
        : environmentId === "garagem"
        ? 110
        : environmentId === "cabana"
        ? 95
        : 80;

    const slantBase = environmentId === "estrada" ? -1.8 : -0.7;

    for (let i = 0; i < count; i++) {
      const isForeground = i % 5 === 0;
      const isBackground = i % 2 === 0;
      raindrops.push({
        x: Math.random() * width * 1.3 - width * 0.15,
        y: Math.random() * height,
        speed: isForeground
          ? 8 + Math.random() * 6
          : isBackground
          ? 3.5 + Math.random() * 3
          : 5.5 + Math.random() * 4,
        length: isForeground
          ? 22 + Math.random() * 18
          : isBackground
          ? 10 + Math.random() * 12
          : 15 + Math.random() * 14,
        opacity: isForeground
          ? 0.18 + Math.random() * 0.18
          : isBackground
          ? 0.04 + Math.random() * 0.08
          : 0.10 + Math.random() * 0.12,
        width: isForeground ? 1.4 : isBackground ? 0.7 : 1.0,
        slant: slantBase + (Math.random() * 0.4 - 0.2),
        layer: isForeground ? "fg" : isBackground ? "bg" : "mid",
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        ctx.beginPath();
        ctx.lineWidth = drop.width;
        ctx.strokeStyle = `rgba(215, 230, 245, ${drop.opacity})`;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.slant * drop.length * 0.35, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += drop.slant * drop.speed * 0.35;

        if (drop.y > height + 20) {
          drop.y = -30;
          drop.x = Math.random() * width * 1.3 - width * 0.15;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [environmentId]);

  return (
    <div
      className={`relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden transition-all duration-700 select-none ${
        isLampOn ? "bg-[#181412]" : "bg-[#080706]"
      }`}
      style={{
        filter: isLampOn
          ? env.lighting.ambientFilter
          : isCinemaMode
          ? "brightness(26%) contrast(130%)"
          : "brightness(32%) contrast(125%) saturate(85%)",
      }}
    >
      {/* ========================================================================= */}
      {/* 1. SCENOGRAPHY: GARAGEM (Workshop aconchegante, porta aberta p/ chuva e carro) */}
      {/* ========================================================================= */}
      {environmentId === "garagem" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Concrete / Brick Wall Background Texture */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#231e19]" : "bg-[#0b0908]"
            }`}
          />

          {/* Large Open Garage Aperture on Left/Top (Showing Pine Forest under Night Storm) */}
          <div className="absolute top-0 left-0 w-[45vw] min-w-[320px] max-w-[620px] h-[82vh] bg-gradient-to-b from-[#09110d] via-[#0d1712] to-[#080d0a] border-r-2 border-b-2 border-[#38312a]/50 overflow-hidden shadow-2xl">
            {/* Misty Night Forest Outside */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
            
            {/* Distant Dense Pine Trees */}
            <svg
              className="absolute bottom-0 left-0 w-full h-72 text-[#050907]/95"
              viewBox="0 0 500 220"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <polygon points="10,220 35,50 60,220" />
              <polygon points="45,220 75,30 105,220" />
              <polygon points="90,220 125,70 160,220" />
              <polygon points="145,220 180,40 215,220" />
              <polygon points="200,220 240,60 280,220" />
              <polygon points="265,220 305,20 345,220" />
              <polygon points="330,220 370,55 410,220" />
              <polygon points="395,220 435,35 475,220" />
              <polygon points="460,220 490,75 520,220" />
            </svg>

            {/* Garage Door Rolled Up Slat Mechanism */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#1f1b17] border-b border-[#3d352e] flex flex-col justify-between py-1 px-3">
              <div className="w-full h-[1px] bg-stone-700/50" />
              <div className="w-full h-[1px] bg-stone-700/50" />
              <div className="w-full h-[1px] bg-stone-700/50" />
            </div>

            {/* Wet threshold puddle reflections */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-emerald-950/30 to-transparent" />
          </div>

          {/* Parked Classic Coupe on Left */}
          <div className="absolute bottom-10 left-0 w-[36vw] min-w-[300px] max-w-[480px] h-[38vh] z-0 opacity-90 transition-all duration-700">
            <svg
              viewBox="0 0 400 220"
              className={`w-full h-full transition-colors duration-700 ${
                isLampOn ? "text-[#2a231d]" : "text-[#12100d]"
              }`}
              fill="currentColor"
            >
              {/* Coupe Profile Body */}
              <path d="M 0 160 Q 50 145 110 145 L 170 145 Q 210 108 260 98 Q 320 94 360 120 L 390 145 Q 400 155 400 180 L 400 210 L 0 210 Z" />
              {/* Glass reflections */}
              <path d="M 215 140 Q 255 112 295 106 Q 340 106 355 138 Z" fill={isLampOn ? "#1a1614" : "#080706"} opacity="0.92" />
              <path d="M 145 140 L 205 140 L 205 115 Q 170 125 145 140 Z" fill={isLampOn ? "#1a1614" : "#080706"} opacity="0.85" />
              {/* Chrome wheel trim */}
              <circle cx="85" cy="185" r="32" fill="#0f0d0c" />
              <circle cx="85" cy="185" r="22" fill="#201a16" stroke="#4a3e35" strokeWidth="2.5" />
              <circle cx="335" cy="185" r="32" fill="#0f0d0c" />
              <circle cx="335" cy="185" r="22" fill="#201a16" stroke="#4a3e35" strokeWidth="2.5" />
            </svg>

            {/* Glowing Amber Side Marker */}
            <div className="absolute bottom-16 right-10 w-3 h-2 rounded-sm bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,1)]" />
            <div className="absolute -bottom-4 right-4 w-44 h-10 bg-amber-500/20 rounded-full blur-xl" />
          </div>

          {/* Workbench & Tool Rack Silhouette on Right */}
          <div className="absolute top-16 right-10 opacity-50 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-16 h-2 bg-[#3f352b] rounded-full" />
              <div className="w-24 h-2 bg-[#3f352b] rounded-full" />
              <div className="w-10 h-2 bg-[#3f352b] rounded-full" />
            </div>
            <div className="flex items-center gap-4 pl-4">
              <div className="w-8 h-8 rounded-lg border border-[#483d32] bg-[#1a1613]" />
              <div className="w-6 h-10 rounded border border-[#483d32] bg-[#1a1613]" />
            </div>
          </div>

          {/* Hanging Industrial Tungsten Work Lamp (Clickable Toggle) */}
          <div
            onClick={onToggleLamp}
            className="absolute top-0 right-1/3 flex flex-col items-center pointer-events-auto cursor-pointer group z-30"
            title={isLampOn ? "Apagar a luz da bancada" : "Acender a luz da bancada"}
          >
            <div className="w-[1.5px] h-20 bg-stone-600 transition-colors group-hover:bg-amber-400" />
            <div className="w-7 h-4 bg-stone-800 rounded-t-md border border-stone-600 shadow-md" />
            <div
              className={`w-5 h-5 rounded-full transition-all duration-500 ${
                isLampOn
                  ? "bg-amber-300 shadow-[0_0_60px_rgba(245,158,11,1)]"
                  : "bg-stone-700 group-hover:bg-stone-500"
              }`}
            />
          </div>

          {/* Volumetric Warm Conical Glow */}
          {isLampOn && (
            <div className="absolute top-20 right-1/3 -translate-x-1/2 w-[600px] h-[550px] bg-amber-500/[0.16] rounded-full blur-3xl pointer-events-none transition-opacity duration-700" />
          )}

          {/* Concrete Wet Floor Base */}
          <div
            className={`absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t transition-colors duration-700 ${
              isLampOn
                ? "from-[#1f1914] via-[#1a1511] to-transparent border-t border-white/[0.08]"
                : "from-[#0d0a08] to-transparent border-t border-white/[0.02]"
            }`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCENOGRAPHY: CABANA (Chalé de Madeira, Lareira e Chuva na Floresta) */}
      {/* ========================================================================= */}
      {environmentId === "cabana" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Deep Mahogany Timber Walls */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#281b12]" : "bg-[#0d0805]"
            }`}
          />

          {/* Large Forest Window with Rain Droplets Running on Glass */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[74vw] max-w-5xl h-[58vh] rounded-2xl border-4 border-[#3e2719] bg-[#09110d] overflow-hidden shadow-2xl">
            {/* Distant Misty Forest Under Constant Mountain Rain */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a140f] via-[#0e1c15] to-[#070d0a]" />

            {/* Pine Trees Silhouette */}
            <svg
              className="absolute bottom-0 left-0 w-full h-full text-[#040806]/95"
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <polygon points="40,300 85,50 130,300" />
              <polygon points="110,300 155,25 200,300" />
              <polygon points="190,300 240,70 290,300" />
              <polygon points="295,300 350,15 405,300" />
              <polygon points="390,300 440,60 490,300" />
              <polygon points="475,300 525,35 575,300" />
            </svg>

            {/* Window Wooden Grid Panes */}
            <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-[#3e2719] shadow-md" />
            <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-[#3e2719] shadow-md" />
            <div className="absolute left-0 right-0 top-1/2 h-2 bg-[#3e2719] shadow-md" />

            {/* Vertical Rain Streaks / Condensation on Window Panes */}
            <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_28px,rgba(255,255,255,0.05)_29px,transparent_30px)]" />
          </div>

          {/* Stone Fireplace with Crackling Embers & Flame (Bottom Left - Clickable) */}
          <div
            onClick={onToggleLamp}
            className="absolute bottom-8 left-8 w-52 h-44 flex flex-col justify-end pointer-events-auto cursor-pointer group z-30"
            title={isLampOn ? "Apagar a lareira da cabana" : "Acender a lareira da cabana"}
          >
            <div className="w-full h-28 rounded-t-2xl bg-[#23160e] border-2 border-[#452b1b] p-3 flex items-end justify-center group-hover:border-amber-500/60 transition-colors shadow-2xl">
              {/* Animated Fire Flame & Embers */}
              <div
                className={`w-24 h-8 bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-300 rounded-full blur-sm transition-opacity duration-500 ${
                  isLampOn ? "opacity-95 animate-flame" : "opacity-30"
                }`}
              />
              <div
                className={`w-14 h-4 bg-amber-300 rounded-full blur-[2px] -mb-1 transition-opacity duration-500 ${
                  isLampOn ? "opacity-100 animate-pulse" : "opacity-20"
                }`}
              />
            </div>
            {/* Warm Fireplace Radial Hearth Glow */}
            {isLampOn && (
              <div className="absolute bottom-0 left-0 w-80 h-52 bg-orange-600/30 rounded-full blur-3xl pointer-events-none" />
            )}
          </div>

          {/* Wooden Floor Planks */}
          <div
            className={`absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t transition-colors duration-700 ${
              isLampOn
                ? "from-[#24170e] via-[#1d120a] to-transparent border-t border-[#452b1b]/70"
                : "from-[#100905] to-transparent border-t border-[#23160e]/50"
            }`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SCENOGRAPHY: ESTRADA (Viagem Noturna, Parabrisa Molhado e Asfalto na Chuva) */}
      {/* ========================================================================= */}
      {environmentId === "estrada" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Deep Stormy Sky & Mountain Horizon */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#131924]" : "bg-[#06080d]"
            }`}
          />

          {/* Curved Mountain Highway Perspective */}
          <div className="absolute inset-x-0 top-0 h-[68vh] overflow-hidden">
            {/* Dark Mountain Pass Silhouettes */}
            <svg
              className={`absolute bottom-16 left-0 w-full h-56 transition-colors duration-700 ${
                isLampOn ? "text-[#0a0f18]" : "text-[#020406]"
              }`}
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M 0 200 Q 140 100 290 125 T 600 115 L 600 200 Z" />
            </svg>

            {/* Wet Asphalt Highway with Headlight Reflections */}
            <svg
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[76vw] h-52"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
            >
              <polygon points="175,0 225,0 375,200 25,200" fill={isLampOn ? "#18202e" : "#0b0f16"} />
              {/* Center Wet Dashed Road Markings */}
              <line
                x1="200"
                y1="0"
                x2="200"
                y2="200"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="18, 22"
                opacity={isLampOn ? "0.75" : "0.45"}
              />
            </svg>
            {/* Headlight beam on road */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55vw] h-40 bg-amber-400/[0.12] rounded-full blur-3xl" />
          </div>

          {/* Windshield Droplet & Wiper Sweep Arc Overlay */}
          <div className="absolute inset-x-0 top-0 h-[72vh] opacity-35 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(20,30,45,0.6)_100%)] pointer-events-none" />

          {/* Car Interior Cockpit / Dashboard (Bottom Base) */}
          <div
            className={`absolute bottom-0 inset-x-0 h-44 border-t-2 flex items-center justify-between px-6 sm:px-16 transition-colors duration-700 ${
              isLampOn ? "bg-[#111620] border-[#222c3e]" : "bg-[#080b10] border-[#131924]"
            }`}
          >
            {/* Glowing Analog Amber Dials */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border border-amber-500/40 bg-[#0a0e16] flex flex-col items-center justify-center shadow-inner">
                <span className="text-[10px] font-mono font-bold text-amber-400">80 km/h</span>
                <span className="text-[8px] font-mono text-stone-500">SPEED</span>
              </div>
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-amber-500/30 bg-[#0a0e16] flex flex-col items-center justify-center shadow-inner">
                <span className="text-[9px] font-mono font-bold text-amber-500/90">2.4 RPM</span>
                <span className="text-[7px] font-mono text-stone-500">TACHO</span>
              </div>
            </div>

            {/* Center Status Tag */}
            <div className="text-center">
              <div className="text-[11px] font-mono text-amber-300/80 uppercase tracking-widest flex items-center gap-1.5 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Chuva na Serra
              </div>
              <div className="text-[10px] text-stone-500 font-mono mt-0.5">Viagem Noturna</div>
            </div>

            {/* Right Glovebox / Analog Clock */}
            <div className="w-14 h-14 rounded-full border border-white/10 bg-[#0a0e16] flex flex-col items-center justify-center hidden sm:flex">
              <span className="text-[10px] font-mono text-stone-300">02:40</span>
              <span className="text-[7px] font-mono text-stone-500">TIME</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCENOGRAPHY: QUARTO (Refúgio Aconchegante, Abajur de Linho e Chuva na Vidraça) */}
      {/* ========================================================================= */}
      {environmentId === "quarto" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Muted Slate / Linen Wall Texture */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#231e28]" : "bg-[#0a080d]"
            }`}
          />

          {/* Bedroom French Window on Right (Rain trickling with Night City Bokeh Lights) */}
          <div className="absolute top-10 right-10 sm:right-16 w-56 sm:w-68 h-72 sm:h-88 rounded-2xl border-2 border-white/[0.14] bg-[#0a0710] overflow-hidden shadow-2xl">
            {/* Deep Night Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a16] to-[#06040a]" />

            {/* Warm Blurred Bokeh City/Garden Lights Outside */}
            <div className="absolute top-16 left-10 w-12 h-12 rounded-full bg-amber-500/25 blur-lg animate-pulse" />
            <div className="absolute bottom-20 right-8 w-16 h-16 rounded-full bg-orange-500/20 blur-xl" />
            <div className="absolute top-28 right-14 w-8 h-8 rounded-full bg-emerald-500/15 blur-md" />

            {/* Window Mullions */}
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/20 shadow-sm" />
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-white/20 shadow-sm" />
            <div className="absolute left-0 right-0 top-1/4 h-[1px] bg-white/10" />
            <div className="absolute left-0 right-0 top-3/4 h-[1px] bg-white/10" />

            {/* Trickling Condensation Streaks */}
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.15)_0%,transparent_70%)]" />
          </div>

          {/* Artisanal Linen Lamp & Bedside Table on Left (Clickable Toggle) */}
          <div
            onClick={onToggleLamp}
            className="absolute bottom-10 left-8 sm:left-14 flex flex-col items-center pointer-events-auto cursor-pointer group z-30"
            title={isLampOn ? "Apagar o abajur de linho" : "Acender o abajur de linho"}
          >
            {/* Linen Shade */}
            <div
              className={`w-20 sm:w-24 h-16 sm:h-20 rounded-t-xl transition-all duration-700 ${
                isLampOn
                  ? "bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 text-stone-950 shadow-[0_0_80px_rgba(245,158,11,0.8)]"
                  : "bg-stone-700 group-hover:bg-stone-600"
              }`}
            />
            {/* Turned Wood Stem & Base */}
            <div className="w-2.5 h-16 bg-[#38261a]" />
            <div className="w-14 h-3 bg-[#24170e] rounded-full shadow-md" />
            {/* Nightstand Table */}
            <div className="w-28 sm:w-32 h-14 bg-[#1c1622] rounded-t-xl border-t border-white/10 mt-1 shadow-lg" />
          </div>

          {/* Warm Radiant Light Diffusion */}
          {isLampOn && (
            <div className="absolute bottom-24 left-6 sm:left-12 w-[450px] h-[450px] bg-amber-500/[0.18] rounded-full blur-3xl pointer-events-none transition-opacity duration-700" />
          )}

          {/* Dark Herringbone Flooring Base */}
          <div
            className={`absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t transition-colors duration-700 ${
              isLampOn
                ? "from-[#1e1724] via-[#16111a] to-transparent border-t border-white/[0.06]"
                : "from-[#0c0910] to-transparent border-t border-white/[0.02]"
            }`}
          />
        </div>
      )}

      {/* Global Natural Rain Layer (Multi-layer Canvas) */}
      <canvas
        ref={rainCanvasRef}
        className="absolute inset-0 pointer-events-none z-10 opacity-75"
      />

      {/* Atmospheric Vignette Frame (Gentle when light is on, intimate cinema spotlight when off) */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 transition-all duration-700 ${
          isLampOn
            ? "bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.42)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.88)_85%)]"
        }`}
      />

      {/* Main Intimate Room Space */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center pt-14 pb-24 px-4 sm:px-8">
        {children}
      </div>
    </div>
  );
}

