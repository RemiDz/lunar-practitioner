'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GeoLocation } from '@/types/lunar';

const STORAGE_KEY_LOCATION = 'lp-location';
const STORAGE_KEY_INSTRUMENTS = 'lp-instruments';

interface UseSettingsReturn {
  locationOverride: GeoLocation | null;
  setLocationOverride: (loc: GeoLocation | null) => void;
  userInstruments: string[];
  setUserInstruments: (instruments: string[]) => void;
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

  // Hydrate from localStorage on mount (handles SSR mismatch)
  useEffect(() => {
    setLocationState(readJson<GeoLocation | null>(STORAGE_KEY_LOCATION, null));
    setInstrumentsState(readJson<string[]>(STORAGE_KEY_INSTRUMENTS, []));
  }, []);

  return {
    locationOverride,
    setLocationOverride,
    userInstruments,
    setUserInstruments,
  };
}
