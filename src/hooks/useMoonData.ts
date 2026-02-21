'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MoonData, ZodiacPosition, GeoLocation, UseMoonDataReturn } from '@/types/lunar';
import { getMoonData } from '@/lib/moon-calculations';
import { getMoonZodiacPosition } from '@/lib/zodiac-calculations';

// Default fallback: London, UK
const DEFAULT_LOCATION: GeoLocation = {
  latitude: 51.5074,
  longitude: -0.1278,
  source: 'fallback',
  label: 'London, UK (default)',
};

const UPDATE_INTERVAL = 60_000; // 60 seconds

/**
 * Core hook that provides all moon data and zodiac position.
 * Uses device geolocation with fallback, updates every 60 seconds.
 * Accepts optional locationOverride from settings.
 */
export function useMoonData(locationOverride?: GeoLocation | null): UseMoonDataReturn {
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [zodiacPosition, setZodiacPosition] = useState<ZodiacPosition | null>(null);
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply location override from settings
  useEffect(() => {
    if (locationOverride) {
      setLocation(locationOverride);
    }
  }, [locationOverride]);

  // Request device geolocation only if no override is set
  useEffect(() => {
    if (locationOverride) return; // Skip device geolocation when override is active

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return; // Keep fallback
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: 'device',
        });
      },
      () => {
        // Geolocation denied or unavailable — keep fallback silently
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [locationOverride]);

  // Calculate moon data
  const calculate = useCallback(async () => {
    try {
      const now = new Date();
      const moon = getMoonData(location.latitude, location.longitude, now);
      setMoonData(moon);

      const zodiac = await getMoonZodiacPosition(now);
      setZodiacPosition(zodiac);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
    } finally {
      setIsLoading(false);
    }
  }, [location.latitude, location.longitude]);

  // Initial calculation + interval
  useEffect(() => {
    calculate();
    const interval = setInterval(calculate, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [calculate]);

  return {
    moonData,
    zodiacPosition,
    location,
    isLoading,
    error,
  };
}
