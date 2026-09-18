export interface MediaDeviceInfoList {
  audioInputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
}

export class MediaManager {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private speakingInterval: NodeJS.Timeout | null = null;
  private onSpeakingChange: ((isSpeaking: boolean) => void) | null = null;

  public async getMediaDevices(): Promise<MediaDeviceInfoList> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return { audioInputs: [], videoInputs: [] };
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audioInputs: devices.filter((d) => d.kind === "audioinput"),
        videoInputs: devices.filter((d) => d.kind === "videoinput"),
      };
    } catch {
      return { audioInputs: [], videoInputs: [] };
    }
  }

  public async startAudioVideo(
    video: boolean = true,
    audio: boolean = true,
    audioDeviceId?: string,
    videoDeviceId?: string
  ): Promise<{ stream: MediaStream | null; error?: string; cancelled?: boolean }> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return { stream: null, error: "Navegador não suporta captura de áudio/vídeo." };
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: audio
          ? audioDeviceId
            ? {
                deviceId: { exact: audioDeviceId },
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
          : false,
        video: video
          ? videoDeviceId
            ? {
                deviceId: { exact: videoDeviceId },
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                frameRate: { ideal: 30 },
              }
            : {
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                frameRate: { ideal: 30 },
                facingMode: "user",
              }
          : false,
      };

      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (initialErr: any) {
        // Fallback for devices that don't support high-res video constraints
        if (initialErr.name === "OverconstrainedError" || initialErr.name === "ConstraintNotSatisfiedError") {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: audio,
            video: video ? { facingMode: "user" } : false,
          });
        } else {
          throw initialErr;
        }
      }

      this.initVoiceActivityDetection();
      return { stream: this.localStream };
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        return { stream: null, cancelled: true };
      }
      
      let message = "Não foi possível acessar a câmera ou microfone.";
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "Nenhum dispositivo de vídeo/áudio conectado foi encontrado.";
      }
      return { stream: null, error: message };
    }
  }

  public toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  public toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public async startScreenShare(): Promise<{ stream: MediaStream | null; error?: string; cancelled?: boolean }> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      return {
        stream: null,
        error: "Seu navegador não suporta captura de tela nativa. Utilize o Chrome, Edge, Firefox ou Safari recente.",
      };
    }

    try {
      // Universal browser getDisplayMedia constraints (supports full screen, windows and tabs with system audio)
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      return { stream: this.screenStream };
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        return { stream: null, cancelled: true };
      }
      // Fallback without audio constraint in case system denies system audio capture
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        return { stream: this.screenStream };
      } catch (fallbackErr: any) {
        if (fallbackErr.name === "NotAllowedError" || fallbackErr.name === "PermissionDeniedError") {
          return { stream: null, cancelled: true };
        }
        return { stream: null, error: "Não foi possível iniciar o compartilhamento de tela." };
      }
    }
  }

  public stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
  }

  public stopAll() {
    this.stopScreenShare();
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.speakingInterval) {
      clearInterval(this.speakingInterval);
      this.speakingInterval = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
  }

  public setOnSpeakingChange(cb: (isSpeaking: boolean) => void) {
    this.onSpeakingChange = cb;
  }

  private initVoiceActivityDetection() {
    if (!this.localStream) return;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.localStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const buffer = new Uint8Array(this.analyser.frequencyBinCount);

      if (this.speakingInterval) clearInterval(this.speakingInterval);
      this.speakingInterval = setInterval(() => {
        if (!this.analyser || !this.onSpeakingChange) return;
        this.analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const average = sum / buffer.length;
        const isSpeaking = average > 18;
        this.onSpeakingChange(isSpeaking);
      }, 150);
    } catch {}
  }
}

export const mediaManager = new MediaManager();
