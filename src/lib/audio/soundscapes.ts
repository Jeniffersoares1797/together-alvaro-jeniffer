/**
 * Procedural Web Audio Ambient Soundscape Generator for Together
 * Generates soft rain, crackling fireplace, peaceful night crickets, and coffeehouse murmurs.
 */

class SoundscapeEngine {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private activeSound: string | null = null;
  private cleanupFns: Array<() => void> = [];

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.audioCtx) {
      // Clamped between 0 and 1
      const clamped = Math.max(0, Math.min(1, volume));
      this.gainNode.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.1);
    }
  }

  public play(type: "rain" | "fireplace" | "crickets" | "cafe" | "cinema-hum", volume: number = 0.5) {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);
    this.isPlaying = true;
    this.activeSound = type;

    switch (type) {
      case "rain":
        this.startRainSound(this.gainNode);
        break;
      case "fireplace":
        this.startFireplaceSound(this.gainNode);
        break;
      case "crickets":
        this.startCricketsSound(this.gainNode);
        break;
      case "cafe":
        this.startCafeSound(this.gainNode);
        break;
      case "cinema-hum":
        this.startCinemaHumSound(this.gainNode);
        break;
      default:
        this.startRainSound(this.gainNode);
    }
  }

  public stop() {
    this.cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("Error during audio cleanup", e);
      }
    });
    this.cleanupFns = [];
    this.isPlaying = false;
    this.activeSound = null;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      activeSound: this.activeSound,
    };
  }

  // --- Rain Generator (Pink noise + Lowpass filter + slight random modulation) ---
  private startRainSound(destination: GainNode) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, this.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();

    this.cleanupFns.push(() => {
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
      } catch {}
    });
  }

  // --- Fireplace Generator (Low roar + random crackle pops) ---
  private startFireplaceSound(destination: GainNode) {
    if (!this.audioCtx) return;

    // Low rumble
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(250, this.audioCtx.currentTime);
    filter.Q.setValueAtTime(3, this.audioCtx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();

    // Intermittent crackles
    const interval = setInterval(() => {
      if (!this.audioCtx || !this.isPlaying) return;
      if (Math.random() > 0.4) {
        const osc = this.audioCtx.createOscillator();
        const popGain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200 + Math.random() * 800, this.audioCtx.currentTime);
        popGain.gain.setValueAtTime(0.08 + Math.random() * 0.1, this.audioCtx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
        osc.connect(popGain);
        popGain.connect(destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
      }
    }, 180);

    this.cleanupFns.push(() => {
      clearInterval(interval);
      try {
        noise.stop();
        noise.disconnect();
      } catch {}
    });
  }

  // --- Night Crickets (Rhythmic high-frequency oscillators) ---
  private startCricketsSound(destination: GainNode) {
    if (!this.audioCtx) return;

    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    const cricketGain = this.audioCtx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(4500, this.audioCtx.currentTime);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(4580, this.audioCtx.currentTime);

    lfo.type = "square";
    lfo.frequency.setValueAtTime(14, this.audioCtx.currentTime); // Chirp rhythm
    lfoGain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);

    cricketGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

    lfo.connect(lfoGain.gain);
    osc1.connect(cricketGain);
    osc2.connect(cricketGain);
    cricketGain.connect(destination);

    osc1.start();
    osc2.start();
    lfo.start();

    this.cleanupFns.push(() => {
      try {
        osc1.stop();
        osc2.stop();
        lfo.stop();
        osc1.disconnect();
        osc2.disconnect();
        lfo.disconnect();
      } catch {}
    });
  }

  // --- Cafe Murmur (Warm diffuse lowpass texture) ---
  private startCafeSound(destination: GainNode) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 3;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.09;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, this.audioCtx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();

    this.cleanupFns.push(() => {
      try {
        noise.stop();
        noise.disconnect();
      } catch {}
    });
  }

  // --- Cinema Warm Hum ---
  private startCinemaHumSound(destination: GainNode) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(60, this.audioCtx.currentTime); // Low 60Hz room rumble
    gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(destination);
    osc.start();

    this.cleanupFns.push(() => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
  }
}

// Singleton instance
export const soundscape = typeof window !== "undefined" ? new SoundscapeEngine() : null;
