import type { ZodiacSignName, ZodiacPosition } from '@/types/lunar';
import { ZODIAC_ORDER } from '@/data/zodiac';

// ── Astronomia Imports ──────────────────────
// astronomia is an ESM-only library. We import from specific modules.
// moonposition.position(jde) returns {lon, lat, range} where lon/lat are in radians.
// julian.CalendarGregorian provides Date → JDE conversion.

/**
 * Dynamically imports astronomia modules.
 * These are ESM-only and must be loaded async in Next.js.
 */
async function getAstronomiaModules() {
  console.log('[LP Debug] Loading astronomia modules...');
  const [moonpositionModule, julianModule] = await Promise.all([
    import('astronomia/moonposition'),
    import('astronomia/julian'),
  ]);
  console.log('[LP Debug] astronomia modules loaded OK');
  return {
    moonposition: moonpositionModule.default || moonpositionModule,
    julian: julianModule.default || julianModule,
  };
}

// ── Zodiac Sign from Ecliptic Longitude ─────

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Maps an ecliptic longitude (0–360°) to a zodiac sign.
 * Each sign spans 30° starting from Aries at 0°.
 */
export function getZodiacSignFromLongitude(longitudeDeg: number): ZodiacSignName {
  // Normalise to 0–360
  const normalised = ((longitudeDeg % 360) + 360) % 360;
  const signIndex = Math.floor(normalised / 30);
  return ZODIAC_ORDER[signIndex];
}

/**
 * Gets the degree within the current sign (0–30).
 */
export function getDegreeInSign(longitudeDeg: number): number {
  const normalised = ((longitudeDeg % 360) + 360) % 360;
  return normalised % 30;
}

// ── Full Zodiac Position Calculation ────────

/**
 * Calculates the Moon's zodiac position using astronomia.
 * Returns ecliptic longitude, zodiac sign, and degree within sign.
 */
export async function getMoonZodiacPosition(
  date: Date = new Date()
): Promise<ZodiacPosition> {
  console.log('[LP Debug] getMoonZodiacPosition called');
  const { moonposition, julian } = await getAstronomiaModules();

  // Convert Date to Julian Ephemeris Day
  console.log('[LP Debug] Creating CalendarGregorian...');
  const cal = new julian.CalendarGregorian(date);
  const jde = cal.toJDE();
  console.log('[LP Debug] JDE:', jde);

  // Get geocentric ecliptic position
  console.log('[LP Debug] Getting moon position...');
  const pos = moonposition.position(jde);
  console.log('[LP Debug] Moon pos:', { lon: pos.lon, lat: pos.lat, range: pos.range });

  // pos.lon is in radians — convert to degrees
  const longitudeDeg = pos.lon * RAD_TO_DEG;
  const latitudeDeg = pos.lat * RAD_TO_DEG;

  // Normalise longitude to 0–360
  const normLon = ((longitudeDeg % 360) + 360) % 360;

  return {
    longitude: normLon,
    latitude: latitudeDeg,
    signName: getZodiacSignFromLongitude(normLon),
    degreeInSign: getDegreeInSign(normLon),
    distance: pos.range, // km
  };
}
