// ─────────────────────────────────────────────
// Lunar Practitioner — Shared Types
// ─────────────────────────────────────────────

// ── Moon Phase ──────────────────────────────

export type PhaseName =
  | 'NEW_MOON'
  | 'WAXING_CRESCENT'
  | 'FIRST_QUARTER'
  | 'WAXING_GIBBOUS'
  | 'FULL_MOON'
  | 'WANING_GIBBOUS'
  | 'LAST_QUARTER'
  | 'WANING_CRESCENT';

export interface PhaseConfig {
  name: string;
  subtitle: string;
  quote: string;
  energy: string;
  idealFor: string[];
  avoid: string[];
  frequencies: FrequencyPrescription[];
  instruments: string[];
  colour: string;
}

export interface FrequencyPrescription {
  hz: number;
  label: string;
  type: 'primary' | 'secondary' | 'planetary';
}

// ── Zodiac ──────────────────────────────────

export type ZodiacSignName =
  | 'ARIES'
  | 'TAURUS'
  | 'GEMINI'
  | 'CANCER'
  | 'LEO'
  | 'VIRGO'
  | 'LIBRA'
  | 'SCORPIO'
  | 'SAGITTARIUS'
  | 'CAPRICORN'
  | 'AQUARIUS'
  | 'PISCES';

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Quality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface ZodiacConfig {
  name: string;
  symbol: string;
  element: Element;
  quality: Quality;
  energy: string;
  sessionMood: string;
  idealFor: string[];
  instruments: string[];
  avoidInstruments: string[];
  frequencyBonus: number;
  frequencyBonusLabel: string;
}

// ── Moon Data (from suncalc) ────────────────

export interface MoonData {
  /** Phase value 0–1 (0 = new, 0.5 = full) */
  phase: number;
  /** Named phase */
  phaseName: PhaseName;
  /** Phase display name */
  phaseDisplayName: string;
  /** Illumination fraction 0–1 */
  illumination: number;
  /** Illumination as percentage string */
  illuminationPercent: string;
  /** Phase angle for waxing/waning */
  angle: number;
  /** Altitude above horizon in radians */
  altitude: number;
  /** Azimuth in radians */
  azimuth: number;
  /** Distance from Earth centre in km */
  distance: number;
  /** Moonrise time (null if no rise today) */
  moonrise: Date | null;
  /** Moonset time (null if no set today) */
  moonset: Date | null;
  /** True if moon never sets (polar regions) */
  alwaysUp: boolean;
  /** True if moon never rises (polar regions) */
  alwaysDown: boolean;
  /** Whether moon is currently above the horizon */
  isAboveHorizon: boolean;
  /** Current timestamp of this reading */
  timestamp: Date;
}

// ── Lunar Distance / Perigee-Apogee ─────────

export interface LunarDistance {
  /** Distance in km */
  km: number;
  /** Normalised 0 (perigee) to 1 (apogee) */
  normalised: number;
  /** Whether this counts as a supermoon */
  isSupermoon: boolean;
  /** Whether this counts as a micromoon */
  isMicromoon: boolean;
  /** Human-readable label */
  label: string;
}

// ── Zodiac Position ─────────────────────────

export interface ZodiacPosition {
  /** Ecliptic longitude in degrees 0–360 */
  longitude: number;
  /** Ecliptic latitude in degrees */
  latitude: number;
  /** Zodiac sign name key */
  signName: ZodiacSignName;
  /** Degree within the sign 0–30 */
  degreeInSign: number;
  /** Distance from Earth in km (from astronomia) */
  distance: number;
}

// ── Session Intelligence ────────────────────

export interface SessionIntelligence {
  /** Current phase config */
  phase: PhaseConfig;
  /** Current phase name key */
  phaseName: PhaseName;
  /** Current zodiac config */
  zodiac: ZodiacConfig;
  /** Current zodiac sign key */
  zodiacSignName: ZodiacSignName;
  /** Combined frequency recommendations */
  frequencies: FrequencyPrescription[];
  /** Combined instrument recommendations */
  instruments: string[];
  /** Things to avoid in session */
  avoid: string[];
  /** Session mood / guidance text */
  sessionGuidance: string;
  /** Lunar distance info */
  lunarDistance: LunarDistance;
  /** Whether the moon is waxing */
  isWaxing: boolean;
  /** Phase subtitle */
  subtitle: string;
  /** Phase quote */
  quote: string;
  /** Moon planetary tone */
  moonTone: { hz: number; note: string; label: string };
}

// ── Geolocation ─────────────────────────────

export interface GeoLocation {
  latitude: number;
  longitude: number;
  source: 'device' | 'fallback' | 'manual';
  label?: string;
}

// ── Hook Return Types ───────────────────────

export interface UseMoonDataReturn {
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
  location: GeoLocation;
  isLoading: boolean;
  error: string | null;
}

export interface UseSessionIntelligenceReturn {
  intelligence: SessionIntelligence | null;
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
  location: GeoLocation;
  isLoading: boolean;
  error: string | null;
}
