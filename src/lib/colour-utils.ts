/**
 * Colour utilities for phase-dependent rendering.
 * Interpolates between palette colours based on moon phase (0–1).
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function lerpColour(hex1: string, hex2: string, t: number): string {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  return rgbToHex({ r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) });
}

// Phase colour stops: new moon (dark indigo) → full moon (selenite white/gold) → new moon
const PHASE_COLOUR_STOPS = [
  { at: 0.0, colour: "#0A0A2E" },   // New Moon — Deep Indigo
  { at: 0.125, colour: "#1A1A4E" }, // Waxing Crescent
  { at: 0.25, colour: "#3D3D7A" },  // First Quarter
  { at: 0.375, colour: "#7A7AAE" }, // Waxing Gibbous
  { at: 0.5, colour: "#F0EEF8" },   // Full Moon — Selenite White
  { at: 0.625, colour: "#C8C4DC" }, // Waning Gibbous — Moonsilver
  { at: 0.75, colour: "#5A5A8E" },  // Last Quarter
  { at: 0.875, colour: "#2A2A5E" }, // Waning Crescent
  { at: 1.0, colour: "#0A0A2E" },   // Back to New Moon
];

/**
 * Returns an interpolated colour for the current phase (0–1).
 * 0 = new moon (dark), 0.5 = full moon (bright), 1 = new moon again.
 */
export function getPhaseColour(phase: number): string {
  const p = Math.max(0, Math.min(1, phase));

  for (let i = 0; i < PHASE_COLOUR_STOPS.length - 1; i++) {
    const curr = PHASE_COLOUR_STOPS[i];
    const next = PHASE_COLOUR_STOPS[i + 1];
    if (p >= curr.at && p <= next.at) {
      const t = (p - curr.at) / (next.at - curr.at);
      return lerpColour(curr.colour, next.colour, t);
    }
  }

  return PHASE_COLOUR_STOPS[0].colour;
}

/**
 * Returns halo glow colour — warm gold near full, cool silver elsewhere.
 */
export function getHaloColour(phase: number): string {
  const fullness = 1 - Math.abs(phase - 0.5) * 2; // 0 at new, 1 at full
  return lerpColour("#C8C4DC", "#E8C97A", fullness);
}

/**
 * Returns halo glow intensity (0–1) based on illumination fraction.
 */
export function getHaloIntensity(illumination: number): number {
  return Math.max(0.05, illumination);
}
