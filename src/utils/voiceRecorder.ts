/**
 * Universal High-Compatibility Microphone Voice Recorder.
 * 
 * Supports:
 * 1. Native MediaRecorder (WebM / MP4 / OGG)
 * 2. Fallback AudioContext PCM -> WAV 16-bit PCM (100% compatible across all iOS Safari, Android Chrome & Desktop)
 * 
 * Returns standard playable Base64 audio data URI.
 */

// Helper to write WAV file from Float32 PCM samples
function encodeWav(samples: Float32Array, sampleRate: number): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  // Convert buffer to Base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

class VoiceRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime = 0;

  // Fallback AudioContext PCM recording
  private audioCtx: AudioContext | null = null;
  private pcmChunks: Float32Array[] = [];
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  async start(): Promise<{ success: boolean; error?: string }> {
    try {
      this.audioChunks = [];
      this.pcmChunks = [];

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          success: false,
          error: 'Browser tidak mengizinkan akses mikrofon di halaman HTTP non-secure. Silakan buka di localhost atau beri izin mikrofon.',
        };
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.startTime = Date.now();

      // Check if MediaRecorder is available
      if (typeof MediaRecorder !== 'undefined') {
        let mimeType = '';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        }

        try {
          this.mediaRecorder = mimeType ? new MediaRecorder(this.stream, { mimeType }) : new MediaRecorder(this.stream);
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };
          this.mediaRecorder.start(100);
          return { success: true };
        } catch {
          // Fallback to PCM AudioContext
        }
      }

      // Universal AudioContext PCM capture fallback
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        this.pcmChunks.push(new Float32Array(input));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);

      return { success: true };
    } catch (err: any) {
      console.error('Microphone error:', err);
      return {
        success: false,
        error: err?.message || 'Izin mikrofon ditolak.',
      };
    }
  }

  async stop(): Promise<{ audioUrl: string; durationSeconds: number } | null> {
    const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

    // 1. If native MediaRecorder was active
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        this.mediaRecorder!.onstop = () => {
          const mime = this.mediaRecorder?.mimeType || 'audio/webm';
          const blob = new Blob(this.audioChunks, { type: mime });
          const reader = new FileReader();
          reader.onloadend = () => {
            const url = reader.result as string;
            this.cleanup();
            resolve({ audioUrl: url, durationSeconds });
          };
          reader.onerror = () => {
            this.cleanup();
            resolve(null);
          };
          reader.readAsDataURL(blob);
        };
        this.mediaRecorder!.stop();
      });
    }

    // 2. If PCM AudioContext was active (Universal WAV output)
    if (this.audioCtx && this.pcmChunks.length > 0) {
      const sampleRate = this.audioCtx.sampleRate;
      let totalLength = 0;
      for (const chunk of this.pcmChunks) {
        totalLength += chunk.length;
      }
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of this.pcmChunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const wavDataUrl = encodeWav(combined, sampleRate);
      this.cleanup();
      return { audioUrl: wavDataUrl, durationSeconds };
    }

    this.cleanup();
    return null;
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch {}
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.source && this.processor) {
      try {
        this.source.disconnect();
        this.processor.disconnect();
      } catch {}
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch {}
      this.audioCtx = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.pcmChunks = [];
  }
}

export const voiceRecorder = new VoiceRecorderService();
