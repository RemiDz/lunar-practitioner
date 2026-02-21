'use client';

import { useMemo } from 'react';
import type { UseSessionIntelligenceReturn, GeoLocation } from '@/types/lunar';
import { useMoonData } from './useMoonData';
import { buildSessionIntelligence } from '@/lib/session-intelligence';

/**
 * Combines moon data and zodiac position into complete session intelligence
 * for practitioners. This is the primary hook for the Session Intelligence Panel.
 * Accepts optional locationOverride from settings.
 */
export function useSessionIntelligence(
  locationOverride?: GeoLocation | null
): UseSessionIntelligenceReturn {
  const { moonData, zodiacPosition, location, isLoading, error } = useMoonData(locationOverride);

  const intelligence = useMemo(() => {
    if (!moonData || !zodiacPosition) return null;
    return buildSessionIntelligence(moonData, zodiacPosition);
  }, [moonData, zodiacPosition]);

  return {
    intelligence,
    moonData,
    zodiacPosition,
    location,
    isLoading,
    error,
  };
}
