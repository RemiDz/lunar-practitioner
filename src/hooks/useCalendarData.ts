'use client';

import { useState, useEffect } from 'react';
import type { MoonData, ZodiacPosition, SessionIntelligence } from '@/types/lunar';
import { getMoonData, getLunarDistance } from '@/lib/moon-calculations';
import { getMoonZodiacPosition } from '@/lib/zodiac-calculations';
import { buildSessionIntelligence } from '@/lib/session-intelligence';

export interface CalendarDayData {
  date: Date;
  moonData: MoonData;
  zodiacPosition: ZodiacPosition | null;
  intelligence: SessionIntelligence | null;
  isNewMoon: boolean;
  isFullMoon: boolean;
  isSupermoon: boolean;
  isToday: boolean;
}

const CALENDAR_DAYS = 30;

export function useCalendarData(latitude: number, longitude: number): {
  days: CalendarDayData[];
  isLoading: boolean;
} {
  const [days, setDays] = useState<CalendarDayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function compute() {
      setIsLoading(true);

      const today = new Date();
      today.setHours(12, 0, 0, 0); // Normalize to noon for consistent calculations

      const results: CalendarDayData[] = [];

      // Calculate moon data synchronously for all days first
      const moonDataArr: MoonData[] = [];
      for (let i = 0; i < CALENDAR_DAYS; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + i);
        moonDataArr.push(getMoonData(latitude, longitude, dayDate));
      }

      // Fetch zodiac positions in parallel
      const zodiacPromises = Array.from({ length: CALENDAR_DAYS }, (_, i) => {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + i);
        return getMoonZodiacPosition(dayDate).catch(() => null);
      });

      const zodiacPositions = await Promise.all(zodiacPromises);

      if (cancelled) return;

      const nowDateStr = new Date().toDateString();

      for (let i = 0; i < CALENDAR_DAYS; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + i);

        const moon = moonDataArr[i];
        const zodiac = zodiacPositions[i];
        const intel = moon && zodiac ? buildSessionIntelligence(moon, zodiac) : null;
        const distance = getLunarDistance(moon.distance);

        results.push({
          date: dayDate,
          moonData: moon,
          zodiacPosition: zodiac,
          intelligence: intel,
          isNewMoon: moon.phaseName === 'NEW_MOON',
          isFullMoon: moon.phaseName === 'FULL_MOON',
          isSupermoon: distance.isSupermoon,
          isToday: dayDate.toDateString() === nowDateStr,
        });
      }

      if (!cancelled) {
        setDays(results);
        setIsLoading(false);
      }
    }

    compute();
    return () => { cancelled = true; };
  }, [latitude, longitude]);

  return { days, isLoading };
}
