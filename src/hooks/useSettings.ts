'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GeoLocation } from '@/types/lunar';

const STORAGE_KEY_LOCATION = 'lp-location';
const STORAGE_KEY_INSTRUMENTS = 'lp-instruments';
const STORAGE_KEY_AUDIO_VOLUME = 'lp-audio-volume';
const STORAGE_KEY_AUDIO_ENABLED = 'lp-audio-enabled';

interface UseSettingsReturn {
  locationOverride: GeoLocation | null;
  setLocationOverride: (loc: GeoLocation | null) => void;
  userInstruments: string[];
  setUserInstruments: (instruments: string[]) => void;
  audioVolume: number;
  setAudioVolume: (v: number) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useSettings(): UseSettingsReturn {
  const [locationOverride, setLocationState] = useState<GeoLocation | null>(
    () => readJson<GeoLocation | null>(STORAGE_KEY_LOCATION, null)
  );

  const [userInstruments, setInstrumentsState] = useState<string[]>(
    () => readJson<string[]>(STORAGE_KEY_INSTRUMENTS, [])
  );

  const [audioVolume, setAudioVolumeState] = useState<number>(
    () => readJson<number>(STORAGE_KEY_AUDIO_VOLUME, 0.3)
  );

  const [audioEnabled, setAudioEnabledState] = useState<boolean>(
    () => readJson<boolean>(STORAGE_KEY_AUDIO_ENABLED, true)
  );

  // Persist location to localStorage
  const setLocationOverride = useCallback((loc: GeoLocation | null) => {
    setLocationState(loc);
    if (loc) {
      localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
    } else {
      localStorage.removeItem(STORAGE_KEY_LOCATION);
    }
  }, []);

  // Persist instruments to localStorage
  const setUserInstruments = useCallback((instruments: string[]) => {
    setInstrumentsState(instruments);
    localStorage.setItem(STORAGE_KEY_INSTRUMENTS, JSON.stringify(instruments));
  }, []);

  // Persist audio volume to localStorage
  const setAudioVolume = useCallback((v: number) => {
    setAudioVolumeState(v);
    localStorage.setItem(STORAGE_KEY_AUDIO_VOLUME, JSON.stringify(v));
  }, []);

  // Persist audio enabled to localStorage
  const setAudioEnabled = useCallback((enabled: boolean) => {
    setAudioEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY_AUDIO_ENABLED, JSON.stringify(enabled));
  }, []);

  // Hydrate from localStorage on mount (handles SSR mismatch)
  useEffect(() => {
    setLocationState(readJson<GeoLocation | null>(STORAGE_KEY_LOCATION, null));
    setInstrumentsState(readJson<string[]>(STORAGE_KEY_INSTRUMENTS, []));
    setAudioVolumeState(readJson<number>(STORAGE_KEY_AUDIO_VOLUME, 0.3));
    setAudioEnabledState(readJson<boolean>(STORAGE_KEY_AUDIO_ENABLED, true));
  }, []);

  return {
    locationOverride,
    setLocationOverride,
    userInstruments,
    setUserInstruments,
    audioVolume,
    setAudioVolume,
    audioEnabled,
    setAudioEnabled,
  };
}
