/**
 * Shared motion/animation constants for consistent feel across layers.
 */

// Easing curves
export const EASE_LUNAR = [0.25, 0.1, 0.25, 1.0] as const; // smooth, slightly slow
export const EASE_GLOW = [0.4, 0.0, 0.2, 1.0] as const;    // material-like

// Durations (seconds)
export const DURATION_FADE = 0.8;
export const DURATION_GLOW_PULSE = 4;
export const DURATION_CONSTELLATION_FADE = 1.2;
export const DURATION_SHOOTING_STAR = 1.5;

// Star field
export const STAR_COUNT = 1200;
export const STAR_TWINKLE_SPEED = 0.002;     // radians per frame
export const STAR_PROXIMITY_FADE_RADIUS = 0.15; // fraction of canvas size
export const MILKY_WAY_OPACITY = 0.06;
export const SHOOTING_STAR_CHANCE = 0.001;    // per frame

// Moon orb
export const MOON_LIBRATION_SPEED = 0.0003;   // radians per frame (Y axis)
export const MOON_LIBRATION_AMPLITUDE = 0.08;  // radians

// Phase arc
export const PHASE_ARC_STROKE_WIDTH = 2;

// Halo
export const HALO_BASE_RADIUS = 1.3; // multiplier of moon radius
export const HALO_SUPERMOON_BOOST = 1.15;
