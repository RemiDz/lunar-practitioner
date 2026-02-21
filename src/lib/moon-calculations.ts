import SunCalc from 'suncalc';
import type { PhaseName, MoonData, LunarDistance } from '@/types/lunar';
import { PHASES } from '@/data/phases';

// ── Phase Name Logic ────────────────────────

/**
 * Maps suncalc's 0–1 phase value to one of 8 named phases.
 * Phase 0 = new moon, 0.5 = full moon.
 */
export function getPhaseName(phase: number): PhaseName {
  if (phase < 0.025 || phase > 0.975) return 'NEW_MOON';
  if (phase < 0.25) return 'WAXING_CRESCENT';
  if (phase < 0.275) return 'FIRST_QUARTER';
  if (phase < 0.5) return 'WAXING_GIBBOUS';
  if (phase < 0.525) return 'FULL_MOON';
  if (phase < 0.75) return 'WANING_GIBBOUS';
  if (phase < 0.775) return 'LAST_QUARTER';
  return 'WANING_CRESCENT';
}

/**
 * Returns the display name for a phase.
 */
export function getPhaseDisplayName(phaseName: PhaseName): string {
  return PHASES[phaseName].name;
}

/**
 * Determines whether the moon is waxing (building toward full).
 */
export function isWaxing(phase: number): boolean {
  return phase > 0 && phase < 0.5;
}

/**
 * Returns a descriptive direction string.
 */
export function getPhaseDirection(phase: number): string {
  if (phase < 0.025 || phase > 0.975) return 'New — beginning';
  if (phase < 0.5) return 'Growing toward Full';
  if (phase < 0.525) return 'Full — peak illumination';
  return 'Waning toward New';
}

// ── Core Moon Data ──────────────────────────

/**
 * Calculates all moon data from suncalc for a given location and time.
 */
export function getMoonData(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): MoonData {
  console.log('[LP Debug] getMoonData() entry, lat/lon:', latitude, longitude);
  const illumination = SunCalc.getMoonIllumination(date);
  console.log('[LP Debug] suncalc illumination:', { phase: illumination.phase, fraction: illumination.fraction });
  const position = SunCalc.getMoonPosition(date, latitude, longitude);
  console.log('[LP Debug] suncalc position:', { altitude: position.altitude, distance: position.distance });
  const times = SunCalc.getMoonTimes(date, latitude, longitude);

  const phaseName = getPhaseName(illumination.phase);
  const illumPercent = illumination.fraction * 100;

  return {
    phase: illumination.phase,
    phaseName,
    phaseDisplayName: getPhaseDisplayName(phaseName),
    illumination: illumination.fraction,
    illuminationPercent: illumPercent.toFixed(1) + '%',
    angle: illumination.angle,
    altitude: position.altitude,
    azimuth: position.azimuth,
    distance: position.distance,
    moonrise: times.rise || null,
    moonset: times.set || null,
    alwaysUp: !!times.alwaysUp,
    alwaysDown: !!times.alwaysDown,
    isAboveHorizon: position.altitude > 0,
    timestamp: date,
  };
}

// ── Lunar Distance / Perigee-Apogee ─────────

const PERIGEE_MIN = 356000; // closest possible (km)
const APOGEE_MAX = 406700; // furthest possible (km)
const SUPERMOON_THRESHOLD = 362000;
const MICROMOON_THRESHOLD = 405000;

/**
 * Analyses lunar distance and returns perigee/apogee status.
 */
export function getLunarDistance(distanceKm: number): LunarDistance {
  const normalised = (distanceKm - PERIGEE_MIN) / (APOGEE_MAX - PERIGEE_MIN);

  let label: string;
  if (distanceKm < 362000) {
    label = 'Supermoon \u00b7 Very close';
  } else if (distanceKm < 370000) {
    label = 'Closer than average';
  } else if (distanceKm < 385000) {
    label = 'Near average distance';
  } else if (distanceKm < 400000) {
    label = 'Further than average';
  } else {
    label = 'Micromoon \u00b7 Very distant';
  }

  return {
    km: Math.round(distanceKm),
    normalised: Math.max(0, Math.min(1, normalised)),
    isSupermoon: distanceKm < SUPERMOON_THRESHOLD,
    isMicromoon: distanceKm > MICROMOON_THRESHOLD,
    label,
  };
}

// ── Moonrise Duration ───────────────────────

/**
 * Calculates how long the moon is above the horizon tonight.
 */
export function getMoonDuration(
  moonrise: Date | null,
  moonset: Date | null
): string | null {
  if (!moonrise || !moonset) return null;

  const diffMs = Math.abs(moonset.getTime() - moonrise.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

// ── Next Phase Calculation ──────────────────

/**
 * Estimates the next major phase transition.
 * Searches forward in 1-hour increments to find where the phase name changes.
 */
export function getNextPhaseTransition(
  currentDate: Date = new Date()
): { name: string; phaseName: PhaseName; date: Date; hoursUntil: number } {
  const currentPhaseName = getPhaseName(
    SunCalc.getMoonIllumination(currentDate).phase
  );

  let searchDate = new Date(currentDate);
  const maxHours = 30 * 24; // search up to 30 days

  for (let h = 1; h <= maxHours; h++) {
    searchDate = new Date(currentDate.getTime() + h * 60 * 60 * 1000);
    const futurePhase = SunCalc.getMoonIllumination(searchDate).phase;
    const futurePhaseName = getPhaseName(futurePhase);

    if (futurePhaseName !== currentPhaseName) {
      return {
        name: getPhaseDisplayName(futurePhaseName),
        phaseName: futurePhaseName,
        date: searchDate,
        hoursUntil: h,
      };
    }
  }

  // Fallback (should never reach)
  return {
    name: 'Unknown',
    phaseName: currentPhaseName,
    date: searchDate,
    hoursUntil: maxHours,
  };
}

/**
 * Formats hours until as "X days, Y hours" string.
 */
export function formatTimeUntil(hoursUntil: number): string {
  const days = Math.floor(hoursUntil / 24);
  const hours = hoursUntil % 24;

  if (days === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  if (hours === 0) return `${days} day${days !== 1 ? 's' : ''}`;
  return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
}

/**
 * Calculates progress through the current phase (0–1).
 */
export function getPhaseProgress(phase: number): number {
  // Each of the 8 phases spans roughly 1/8 of the cycle
  // Calculate how far through the current phase segment we are
  const boundaries = [0, 0.025, 0.25, 0.275, 0.5, 0.525, 0.75, 0.775, 1.0];

  let adjustedPhase = phase;
  // Handle wrap-around for new moon
  if (phase > 0.975) adjustedPhase = phase - 1;

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (adjustedPhase >= start && adjustedPhase < end) {
      return (adjustedPhase - start) / (end - start);
    }
  }

  return 0;
}
