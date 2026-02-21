/**
 * Web Audio API singleton engine for ambient drone + tone playback.
 * AudioContext is created lazily on first user gesture (browser autoplay policy).
 */

import { DRONE_FADE_DURATION, TONE_FADE_DURATION, TONE_PLAY_DURATION } from './motion-constants';

const MOON_FUNDAMENTAL = 210.42; // Hz — D#/Eb, Hans Cousto octave method

interface DroneVoice {
  oscillator: OscillatorNode;
  gain: GainNode;
  targetGain: number;
}

export interface AudioEngineState {
  isInitialised: boolean;
  isDroneActive: boolean;
  activeToneHz: number | null;
  volume: number;
}

type Subscriber = (state: AudioEngineState) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneVoices: DroneVoice[] = [];
  private toneOsc: OscillatorNode | null = null;
  private toneGain: GainNode | null = null;
  private toneTimeout: ReturnType<typeof setTimeout> | null = null;
  private subscribers: Set<Subscriber> = new Set();

  private state: AudioEngineState = {
    isInitialised: false,
    isDroneActive: false,
    activeToneHz: null,
    volume: 0.3,
  };

  getState(): AudioEngineState {
    return { ...this.state };
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  private notify() {
    const s = this.getState();
    this.subscribers.forEach((fn) => fn(s));
  }

  private setState(partial: Partial<AudioEngineState>) {
    Object.assign(this.state, partial);
    this.notify();
  }

  /** Initialise AudioContext (must be called from user gesture) */
  init(): boolean {
    if (this.ctx) {
      // iOS Safari: defensively resume
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    }

    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.state.volume;
      this.masterGain.connect(this.ctx.destination);

      // iOS Safari resume
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.setState({ isInitialised: true });
      return true;
    } catch {
      return false;
    }
  }

  /** Start the ambient drone pad (5 sine oscillators at harmonic ratios) */
  startDrone() {
    if (!this.ctx || !this.masterGain) return;
    if (this.state.isDroneActive) return;

    // iOS Safari resume
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const harmonics: [number, number][] = [
      [1, 0.25],     // fundamental 210.42 Hz
      [2, 0.12],     // octave 420.84 Hz
      [3, 0.06],     // 5th above octave 631.26 Hz
      [0.5, 0.15],   // sub-octave 105.21 Hz
      [1.5, 0.04],   // 5th 315.63 Hz
    ];

    const now = this.ctx.currentTime;

    this.droneVoices = harmonics.map(([ratio, targetGain]) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = MOON_FUNDAMENTAL * ratio;

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(targetGain, now + DRONE_FADE_DURATION);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);

      return { oscillator: osc, gain, targetGain };
    });

    this.setState({ isDroneActive: true });
  }

  /** Stop the ambient drone with fade-out */
  stopDrone() {
    if (!this.ctx || this.droneVoices.length === 0) return;

    const now = this.ctx.currentTime;

    this.droneVoices.forEach(({ oscillator, gain }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + DRONE_FADE_DURATION);
      oscillator.stop(now + DRONE_FADE_DURATION + 0.1);
    });

    this.droneVoices = [];
    this.setState({ isDroneActive: false });
  }

  /** Play a single sine tone at the given frequency */
  playTone(hz: number) {
    if (!this.ctx || !this.masterGain) return;

    // iOS Safari resume
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Stop existing tone with fast crossfade
    this.stopToneInternal(0.3);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = hz;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + TONE_FADE_DURATION);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);

    this.toneOsc = osc;
    this.toneGain = gain;

    // Auto fade out after TONE_PLAY_DURATION
    this.toneTimeout = setTimeout(() => {
      this.stopToneInternal(TONE_FADE_DURATION);
      this.setState({ activeToneHz: null });
    }, TONE_PLAY_DURATION * 1000);

    this.setState({ activeToneHz: hz });
  }

  /** Stop the current tone */
  stopTone() {
    this.stopToneInternal(TONE_FADE_DURATION);
    this.setState({ activeToneHz: null });
  }

  private stopToneInternal(fadeDuration: number) {
    if (this.toneTimeout) {
      clearTimeout(this.toneTimeout);
      this.toneTimeout = null;
    }

    if (!this.ctx || !this.toneOsc || !this.toneGain) return;

    const now = this.ctx.currentTime;
    this.toneGain.gain.cancelScheduledValues(now);
    this.toneGain.gain.setValueAtTime(this.toneGain.gain.value, now);
    this.toneGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
    this.toneOsc.stop(now + fadeDuration + 0.1);

    this.toneOsc = null;
    this.toneGain = null;
  }

  /** Set master volume (0–1) */
  setVolume(v: number) {
    const clamped = Math.max(0, Math.min(1, v));
    this.state.volume = clamped;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(clamped, now + 0.05);
    }

    this.notify();
  }

  /** Clean up everything */
  destroy() {
    this.stopDrone();
    this.stopTone();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.masterGain = null;
    this.setState({ isInitialised: false, isDroneActive: false, activeToneHz: null });
  }
}

// Singleton instance
let instance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!instance) {
    instance = new AudioEngine();
  }
  return instance;
}
