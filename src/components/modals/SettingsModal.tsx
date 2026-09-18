"use client";

import { useState, useEffect } from "react";
import { X, Settings, Mic, Video, Sparkles, Sliders } from "lucide-react";
import { mediaManager } from "@/lib/webrtc/media-manager";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLampOn: boolean;
  onToggleLamp: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  isLampOn,
  onToggleLamp,
}: SettingsModalProps) {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      mediaManager.getMediaDevices().then((res) => {
        setAudioDevices(res.audioInputs);
        setVideoDevices(res.videoInputs);
        if (res.audioInputs.length > 0) setSelectedAudioId(res.audioInputs[0].deviceId);
        if (res.videoInputs.length > 0) setSelectedVideoId(res.videoInputs[0].deviceId);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-amber-500/20 shadow-2xl p-6 sm:p-8 overflow-hidden text-[#f6f0e8]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-[#f6f0e8]">
              Configurações
            </h2>
            <p className="text-xs text-stone-400">
              Ajuste seus dispositivos e a iluminação do ambiente.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Microfone */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-stone-300 mb-2">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              Microfone
            </label>
            <select
              value={selectedAudioId}
              onChange={(e) => setSelectedAudioId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-[#f6f0e8] focus:outline-none focus:border-amber-400/50"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microfone ${d.deviceId.substring(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="">Dispositivo Padrão do Sistema</option>
              )}
            </select>
          </div>

          {/* Câmera */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-stone-300 mb-2">
              <Video className="w-3.5 h-3.5 text-amber-400" />
              Câmera
            </label>
            <select
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-[#f6f0e8] focus:outline-none focus:border-amber-400/50"
            >
              {videoDevices.length > 0 ? (
                videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Câmera ${d.deviceId.substring(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="">Câmera Padrão do Sistema</option>
              )}
            </select>
          </div>

          {/* Iluminação Quente Toggle */}
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-medium text-stone-200">Iluminação Quente</div>
                <div className="text-[10px] text-stone-400">Lâmpada aconchegante e lareira</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleLamp}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isLampOn ? "bg-amber-400" : "bg-stone-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-stone-950 transition-transform ${
                  isLampOn ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-xs font-semibold text-stone-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 transition-colors cursor-pointer shadow-md"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
