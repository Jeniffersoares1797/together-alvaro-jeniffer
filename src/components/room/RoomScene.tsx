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

  // Natural Rain Canvas Simulation
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const raindrops: Array<{ x: number; y: number; speed: number; length: number; opacity: number }> = [];
    const count = environmentId === "garagem" || environmentId === "estrada" ? 85 : 55;

    for (let i = 0; i < count; i++) {
      raindrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 4 + Math.random() * 5,
        length: 12 + Math.random() * 18,
        opacity: 0.05 + Math.random() * 0.12,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(200, 220, 235, ${drop.opacity})`;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 0.8, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.3;

        if (drop.y > height) {
          drop.y = -20;
          drop.x = Math.random() * width;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [environmentId]);

  return (
    <div
      className={`relative w-full h-full min-h-screen flex flex-col justify-between overflow-hidden transition-all duration-700 select-none ${
        isLampOn ? "bg-[#1c1815]" : "bg-[#080706]"
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
      {/* 1. SCENOGRAPHY: GARAGEM (Carro estacionado à esquerda, porta aberta, chuva) */}
      {/* ========================================================================= */}
      {environmentId === "garagem" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Background Wall Texture (Concrete / Workshop) */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#25201b]" : "bg-[#0b0a09]"
            }`}
          />

          {/* Open Garage Door View: Forest & Night Sky on Top/Left */}
          <div className="absolute top-0 left-0 w-[42vw] h-[78vh] bg-gradient-to-b from-[#0e1613] via-[#121c17] to-[#0c120f] border-r border-b border-[#3d3630]/40 overflow-hidden">
            {/* Dark Pine Trees Silhouette outside */}
            <svg
              className="absolute bottom-0 left-0 w-full h-64 text-[#060a08]/90"
              viewBox="0 0 500 200"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <polygon points="20,200 45,40 70,200" />
              <polygon points="55,200 85,20 115,200" />
              <polygon points="100,200 135,60 170,200" />
              <polygon points="160,200 195,30 230,200" />
              <polygon points="220,200 260,50 300,200" />
              <polygon points="290,200 330,15 370,200" />
              <polygon points="360,200 400,45 440,200" />
              <polygon points="430,200 470,25 500,200" />
            </svg>
            {/* Distant Misty Night Glow outside */}
            <div className="absolute top-10 left-1/4 w-48 h-48 bg-emerald-900/20 rounded-full blur-3xl" />
          </div>

          {/* Parked Car Silhouette on Left */}
          <div className="absolute bottom-12 left-0 w-[34vw] min-w-[280px] max-w-[460px] h-[36vh] z-0 opacity-90 transition-all duration-700">
            <svg
              viewBox="0 0 400 220"
              className={`w-full h-full transition-colors duration-700 ${
                isLampOn ? "text-[#2e2722]" : "text-[#141210]"
              }`}
              fill="currentColor"
            >
              {/* Car Body Contour (Classic Coupe / Sedan Silhouette) */}
              <path d="M 0 160 Q 50 145 110 145 L 170 145 Q 210 110 260 100 Q 320 95 360 120 L 390 145 Q 400 155 400 180 L 400 210 L 0 210 Z" />
              {/* Windshield & Side Window */}
              <path d="M 215 140 Q 255 112 295 106 Q 340 106 355 138 Z" fill={isLampOn ? "#1a1614" : "#080706"} opacity="0.9" />
              <path d="M 145 140 L 205 140 L 205 115 Q 170 125 145 140 Z" fill={isLampOn ? "#1a1614" : "#080706"} opacity="0.8" />
              {/* Rear Wheel Arch */}
              <circle cx="85" cy="185" r="32" fill="#110f0e" />
              <circle cx="85" cy="185" r="22" fill="#221e1a" stroke="#3d352e" strokeWidth="2" />
              {/* Front Wheel Arch */}
              <circle cx="335" cy="185" r="32" fill="#110f0e" />
              <circle cx="335" cy="185" r="22" fill="#221e1a" stroke="#3d352e" strokeWidth="2" />
            </svg>

            {/* Subtle Amber Side Marker Glow */}
            <div className="absolute bottom-16 right-10 w-2.5 h-1.5 rounded-sm bg-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.9)]" />
            {/* Car Light Reflection on Floor */}
            <div className="absolute -bottom-4 right-4 w-40 h-8 bg-amber-500/15 rounded-full blur-xl" />
          </div>

          {/* Workbench / Wall Pegboard Line on Top Right */}
          <div className="absolute top-16 right-12 opacity-40 flex items-center gap-6">
            <div className="w-16 h-1.5 bg-[#423a32] rounded-full" />
            <div className="w-24 h-1.5 bg-[#423a32] rounded-full" />
            <div className="w-8 h-1.5 bg-[#423a32] rounded-full" />
          </div>

          {/* Hanging Tungsten Work Light Bulb (Above center/right - Clickable) */}
          <div
            onClick={onToggleLamp}
            className="absolute top-0 right-1/3 flex flex-col items-center pointer-events-auto cursor-pointer group"
            title={isLampOn ? "Apagar a luz da garagem" : "Acender a luz da garagem"}
          >
            <div className="w-[1px] h-20 bg-stone-600 transition-colors group-hover:bg-amber-400" />
            <div className="w-6 h-3 bg-stone-700 rounded-t-sm" />
            <div
              className={`w-4 h-4 rounded-full transition-all duration-500 ${
                isLampOn
                  ? "bg-amber-300 shadow-[0_0_50px_rgba(245,158,11,1)]"
                  : "bg-stone-700 group-hover:bg-stone-500"
              }`}
            />
          </div>

          {/* Warm Light Conical Beam on Garage Floor */}
          {isLampOn && (
            <div className="absolute top-20 right-1/3 -translate-x-1/2 w-[550px] h-[500px] bg-amber-500/[0.14] rounded-full blur-3xl pointer-events-none transition-opacity duration-700" />
          )}

          {/* Concrete Floor Base */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t transition-colors duration-700 ${
              isLampOn ? "from-[#221d18] to-transparent border-t border-white/[0.08]" : "from-[#110e0c] to-transparent border-t border-white/[0.02]"
            }`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCENOGRAPHY: CABANA (Madeira nobre, lareira de pedra, janela panorâmica) */}
      {/* ========================================================================= */}
      {environmentId === "cabana" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Deep Wood Grain Wall Texture */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#2c1f15]" : "bg-[#0e0a07]"
            }`}
          />

          {/* Large Forest Window on Background */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[70vw] max-w-4xl h-[55vh] rounded-xl border-4 border-[#3d2a1d] bg-[#0c120e] overflow-hidden shadow-2xl">
            {/* Pine Silhouettes in Night Mist */}
            <svg
              className="absolute bottom-0 left-0 w-full h-full text-[#070e0a]/95"
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <polygon points="50,300 90,60 130,300" />
              <polygon points="120,300 160,30 200,300" />
              <polygon points="210,300 250,80 290,300" />
              <polygon points="310,300 360,20 410,300" />
              <polygon points="420,300 460,70 500,300" />
              <polygon points="490,300 540,40 580,300" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-[#09100c] via-transparent to-transparent" />
            {/* Window Wooden Grid Panes */}
            <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-[#3d2a1d]" />
            <div className="absolute left-0 right-0 top-1/2 h-1.5 bg-[#3d2a1d]" />
          </div>

          {/* Stone Fireplace Embers (Bottom Left - Clickable) */}
          <div
            onClick={onToggleLamp}
            className="absolute bottom-8 left-8 w-48 h-38 flex flex-col justify-end pointer-events-auto cursor-pointer group"
            title={isLampOn ? "Apagar a lareira" : "Acender a lareira"}
          >
            <div className="w-full h-24 rounded-t-2xl bg-[#261a11] border border-[#483323] p-3 flex items-end justify-center group-hover:border-amber-500/50 transition-colors">
              {/* Embers */}
              <div
                className={`w-20 h-6 bg-gradient-to-t from-orange-600 to-amber-500 rounded-full blur-sm transition-opacity duration-500 ${
                  isLampOn ? "opacity-95 animate-flame" : "opacity-30"
                }`}
              />
              <div
                className={`w-12 h-3 bg-amber-400 rounded-full blur-[2px] -mb-1 transition-opacity duration-500 ${
                  isLampOn ? "opacity-100 animate-pulse" : "opacity-20"
                }`}
              />
            </div>
            {/* Hearth Glow */}
            {isLampOn && (
              <div className="absolute bottom-0 left-0 w-64 h-40 bg-orange-600/25 rounded-full blur-3xl pointer-events-none" />
            )}
          </div>

          {/* Wooden Floor Planks */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t transition-colors duration-700 ${
              isLampOn ? "from-[#281c13] to-transparent border-t border-[#4a3424]/60" : "from-[#140e09] to-transparent border-t border-[#291c12]/40"
            }`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ESTRADA (Viagem noturna no carro, chuva no parabrisa, serra escura) */}
      {/* ========================================================================= */}
      {environmentId === "estrada" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Deep Night Atmosphere */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#161c28]" : "bg-[#07090d]"
            }`}
          />

          {/* Curved Mountain Highway Perspective */}
          <div className="absolute inset-x-0 top-0 h-[65vh] overflow-hidden">
            {/* Distant Hills / Pines */}
            <svg
              className={`absolute bottom-16 left-0 w-full h-52 transition-colors duration-700 ${
                isLampOn ? "text-[#0c121d]" : "text-[#030508]"
              }`}
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M 0 200 Q 150 110 300 130 T 600 120 L 600 200 Z" />
            </svg>
            {/* Asphalt Road Curve */}
            <svg
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-48"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
            >
              <polygon points="175,0 225,0 360,200 40,200" fill={isLampOn ? "#1a2230" : "#0d1118"} />
              {/* Dashed Center Road Markings */}
              <line x1="200" y1="0" x2="200" y2="200" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="16, 20" opacity={isLampOn ? "0.6" : "0.35"} />
            </svg>
          </div>

          {/* Car Windshield Frame & Hood Outline */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-44 border-t-2 flex items-center justify-around px-12 transition-colors duration-700 ${
              isLampOn ? "bg-[#141b27] border-[#253046]" : "bg-[#0a0d13] border-[#161c28]"
            }`}
          >
            {/* Analog Amber Dashboard Dials */}
            <div className="flex items-center gap-6 opacity-85">
              <div className="w-16 h-16 rounded-full border border-amber-500/40 bg-[#0c111a] flex items-center justify-center shadow-inner">
                <span className="text-[10px] font-mono text-amber-400">80 km/h</span>
              </div>
              <div className="w-12 h-12 rounded-full border border-amber-500/30 bg-[#0c111a] flex items-center justify-center shadow-inner">
                <span className="text-[9px] font-mono text-amber-500/90">2.2 RPM</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-stone-400 uppercase tracking-widest">
              Noite na Serra
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QUARTO (Abajur de linho, cama macia e chuva na vidraça) */}
      {/* ========================================================================= */}
      {environmentId === "quarto" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden transition-colors duration-700">
          {/* Muted Slate / Plaster Wall */}
          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isLampOn ? "bg-[#25212c]" : "bg-[#0b0a0e]"
            }`}
          />

          {/* Window on Top Right with Rain */}
          <div className="absolute top-10 right-16 w-64 h-80 rounded-2xl border border-white/[0.12] bg-[#0c0a10] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-[#110d18] to-[#08060c]" />
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.2)_0%,transparent_70%)]" />
            {/* Window Mullions */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/15" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/15" />
          </div>

          {/* Bedside Table & Linen Lamp on Left (Clickable) */}
          <div
            onClick={onToggleLamp}
            className="absolute bottom-12 left-14 flex flex-col items-center pointer-events-auto cursor-pointer group"
            title={isLampOn ? "Apagar o abajur" : "Acender o abajur"}
          >
            {/* Linen Shade */}
            <div
              className={`w-22 h-18 rounded-t-lg transition-all duration-700 ${
                isLampOn
                  ? "bg-gradient-to-b from-amber-100 to-amber-200 text-stone-950 shadow-[0_0_70px_rgba(245,158,11,0.7)]"
                  : "bg-stone-700 group-hover:bg-stone-600"
              }`}
            />
            {/* Wooden Base */}
            <div className="w-2.5 h-16 bg-[#3a2b20]" />
            <div className="w-14 h-3 bg-[#2a1e16] rounded-full shadow-md" />
            {/* Nightstand */}
            <div className="w-28 h-12 bg-[#211b26] rounded-t-lg border-t border-white/10 mt-1" />
          </div>

          {/* Soft Warm Light Projection */}
          {isLampOn && (
            <div className="absolute bottom-28 left-8 w-96 h-96 bg-amber-500/[0.16] rounded-full blur-3xl pointer-events-none" />
          )}

          {/* Floor Planks */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t transition-colors duration-700 ${
              isLampOn ? "from-[#221c27] to-transparent border-t border-white/[0.05]" : "from-[#110e14] to-transparent border-t border-white/[0.02]"
            }`}
          />
        </div>
      )}

      {/* Global Natural Rain Layer (Canvas) */}
      <canvas
        ref={rainCanvasRef}
        className="absolute inset-0 pointer-events-none z-10 opacity-70"
      />

      {/* Atmospheric Vignette Frame (Wide & gentle when light is on, deep cinema spotlight when off) */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 transition-all duration-700 ${
          isLampOn
            ? "bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.45)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.88)_85%)]"
        }`}
      />

      {/* Main Intimate Room Space */}
      <div className="relative z-20 flex-1 flex flex-col justify-center items-center pt-16 pb-24 px-4 sm:px-8">
        {children}
      </div>
    </div>
  );
}

