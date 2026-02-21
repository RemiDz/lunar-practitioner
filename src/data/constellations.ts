import type { ZodiacSignName } from '@/types/lunar';

/**
 * Simplified zodiac constellation data for SVG overlay.
 * Stars are in normalised coordinates (0–1) relative to a square bounding box.
 * Lines connect star indices to form the constellation pattern.
 */

interface ConstellationStar {
  x: number;
  y: number;
  magnitude: number; // 1 = brightest, 4 = dimmest
}

export interface ConstellationData {
  stars: ConstellationStar[];
  lines: [number, number][];
}

export const CONSTELLATIONS: Record<ZodiacSignName, ConstellationData> = {
  ARIES: {
    stars: [
      { x: 0.3, y: 0.4, magnitude: 2 },
      { x: 0.45, y: 0.35, magnitude: 1 },
      { x: 0.6, y: 0.38, magnitude: 2 },
      { x: 0.7, y: 0.5, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3]],
  },
  TAURUS: {
    stars: [
      { x: 0.25, y: 0.55, magnitude: 1 },
      { x: 0.35, y: 0.45, magnitude: 2 },
      { x: 0.45, y: 0.4, magnitude: 2 },
      { x: 0.55, y: 0.35, magnitude: 3 },
      { x: 0.65, y: 0.3, magnitude: 3 },
      { x: 0.5, y: 0.5, magnitude: 2 },
      { x: 0.6, y: 0.55, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]],
  },
  GEMINI: {
    stars: [
      { x: 0.3, y: 0.25, magnitude: 1 },
      { x: 0.35, y: 0.4, magnitude: 2 },
      { x: 0.38, y: 0.55, magnitude: 2 },
      { x: 0.4, y: 0.7, magnitude: 3 },
      { x: 0.6, y: 0.25, magnitude: 1 },
      { x: 0.58, y: 0.4, magnitude: 2 },
      { x: 0.55, y: 0.55, magnitude: 2 },
      { x: 0.53, y: 0.7, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [3, 7]],
  },
  CANCER: {
    stars: [
      { x: 0.35, y: 0.35, magnitude: 3 },
      { x: 0.45, y: 0.45, magnitude: 2 },
      { x: 0.55, y: 0.45, magnitude: 2 },
      { x: 0.65, y: 0.55, magnitude: 3 },
      { x: 0.5, y: 0.6, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4], [2, 4]],
  },
  LEO: {
    stars: [
      { x: 0.25, y: 0.55, magnitude: 1 },
      { x: 0.3, y: 0.4, magnitude: 2 },
      { x: 0.4, y: 0.3, magnitude: 2 },
      { x: 0.55, y: 0.28, magnitude: 2 },
      { x: 0.65, y: 0.35, magnitude: 2 },
      { x: 0.7, y: 0.5, magnitude: 2 },
      { x: 0.6, y: 0.6, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]],
  },
  VIRGO: {
    stars: [
      { x: 0.3, y: 0.35, magnitude: 2 },
      { x: 0.4, y: 0.3, magnitude: 2 },
      { x: 0.5, y: 0.35, magnitude: 1 },
      { x: 0.6, y: 0.4, magnitude: 2 },
      { x: 0.5, y: 0.5, magnitude: 2 },
      { x: 0.4, y: 0.55, magnitude: 3 },
      { x: 0.55, y: 0.65, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [4, 6]],
  },
  LIBRA: {
    stars: [
      { x: 0.5, y: 0.3, magnitude: 2 },
      { x: 0.35, y: 0.45, magnitude: 2 },
      { x: 0.65, y: 0.45, magnitude: 2 },
      { x: 0.3, y: 0.6, magnitude: 2 },
      { x: 0.7, y: 0.6, magnitude: 2 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4]],
  },
  SCORPIO: {
    stars: [
      { x: 0.25, y: 0.3, magnitude: 2 },
      { x: 0.3, y: 0.4, magnitude: 1 },
      { x: 0.35, y: 0.5, magnitude: 2 },
      { x: 0.4, y: 0.55, magnitude: 2 },
      { x: 0.5, y: 0.6, magnitude: 2 },
      { x: 0.6, y: 0.58, magnitude: 2 },
      { x: 0.68, y: 0.5, magnitude: 3 },
      { x: 0.72, y: 0.42, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
  SAGITTARIUS: {
    stars: [
      { x: 0.4, y: 0.25, magnitude: 2 },
      { x: 0.5, y: 0.35, magnitude: 2 },
      { x: 0.45, y: 0.45, magnitude: 1 },
      { x: 0.55, y: 0.45, magnitude: 2 },
      { x: 0.5, y: 0.55, magnitude: 2 },
      { x: 0.4, y: 0.6, magnitude: 3 },
      { x: 0.6, y: 0.6, magnitude: 3 },
      { x: 0.65, y: 0.35, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 7], [2, 4], [4, 5], [4, 6]],
  },
  CAPRICORN: {
    stars: [
      { x: 0.35, y: 0.3, magnitude: 2 },
      { x: 0.45, y: 0.35, magnitude: 2 },
      { x: 0.55, y: 0.4, magnitude: 2 },
      { x: 0.65, y: 0.45, magnitude: 2 },
      { x: 0.6, y: 0.55, magnitude: 3 },
      { x: 0.45, y: 0.55, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1]],
  },
  AQUARIUS: {
    stars: [
      { x: 0.25, y: 0.4, magnitude: 2 },
      { x: 0.35, y: 0.35, magnitude: 2 },
      { x: 0.45, y: 0.38, magnitude: 2 },
      { x: 0.55, y: 0.35, magnitude: 2 },
      { x: 0.65, y: 0.4, magnitude: 2 },
      { x: 0.55, y: 0.55, magnitude: 3 },
      { x: 0.45, y: 0.6, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [2, 6]],
  },
  PISCES: {
    stars: [
      { x: 0.3, y: 0.35, magnitude: 2 },
      { x: 0.35, y: 0.45, magnitude: 3 },
      { x: 0.4, y: 0.55, magnitude: 2 },
      { x: 0.5, y: 0.5, magnitude: 2 },
      { x: 0.6, y: 0.45, magnitude: 3 },
      { x: 0.65, y: 0.35, magnitude: 2 },
      { x: 0.7, y: 0.55, magnitude: 3 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6]],
  },
};
