'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioEngine, type AudioEngineState } from '@/lib/audio-engine';

interface UseAudioReturn {
  isInitialised: boolean;
  isDroneActive: boolean;
  activeToneHz: number | null;
  volume: number;
  initAudio: () => boolean;
  toggleDrone: () => void;
  playTone: (hz: number) => void;
  stopTone: () => void;
  setVolume: (v: number) => void;
}

export function useAudio(): UseAudioReturn {
  const engineRef = useRef(getAudioEngine());
  const [state, setState] = useState<AudioEngineState>(() => engineRef.current.getState());

  useEffect(() => {
    const unsub = engineRef.current.subscribe(setState);
    return unsub;
  }, []);

  const initAudio = useCallback(() => {
    return engineRef.current.init();
  }, []);

  const toggleDrone = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.getState().isInitialised) {
      engine.init();
    }
    if (engine.getState().isDroneActive) {
      engine.stopDrone();
    } else {
      engine.startDrone();
    }
  }, []);

  const playTone = useCallback((hz: number) => {
    const engine = engineRef.current;
    if (!engine.getState().isInitialised) {
      engine.init();
    }
    engine.playTone(hz);
  }, []);

  const stopTone = useCallback(() => {
    engineRef.current.stopTone();
  }, []);

  const setVolume = useCallback((v: number) => {
    engineRef.current.setVolume(v);
  }, []);

  return {
    isInitialised: state.isInitialised,
    isDroneActive: state.isDroneActive,
    activeToneHz: state.activeToneHz,
    volume: state.volume,
    initAudio,
    toggleDrone,
    playTone,
    stopTone,
    setVolume,
  };
}
