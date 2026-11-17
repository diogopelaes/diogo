const SOUND_STORAGE_KEY = 'safari_memory_muted';

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem(SOUND_STORAGE_KEY, String(this.muted));
    return this.muted;
  }

  playTone(freq, duration, type = 'sine', volume = 0.12, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playFlip() {
    this.playTone(420, 0.08, 'triangle', 0.08);
  }

  playMatch() {
    this.playTone(523.25, 0.14, 'sine', 0.12, 0);
    this.playTone(659.25, 0.18, 'sine', 0.13, 0.08);
  }

  playMismatch() {
    this.playTone(210, 0.14, 'triangle', 0.09, 0);
    this.playTone(170, 0.16, 'triangle', 0.08, 0.09);
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.24, 'sine', 0.13, idx * 0.11);
    });
  }
}

export const sound = new SoundManager();
