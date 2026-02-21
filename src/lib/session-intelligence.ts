import type {
  MoonData,
  ZodiacPosition,
  LunarDistance,
  SessionIntelligence,
  FrequencyPrescription,
} from '@/types/lunar';
import { PHASES } from '@/data/phases';
import { ZODIAC_CONFIGS } from '@/data/zodiac';
import { getLunarDistance, isWaxing } from './moon-calculations';

// ── Moon Planetary Tone ─────────────────────
// Hans Cousto's octave method: the Moon's synodic period (29.53059 days)
// octaved up 30 times gives 210.42 Hz, which corresponds to D#/Eb.

const MOON_TONE = {
  hz: 210.42,
  note: 'D#/Eb',
  label: 'Synodic Moon tone (Cousto)',
} as const;

// ── Build Session Intelligence ──────────────

/**
 * Combines moon phase, zodiac position, and lunar distance into
 * a complete session intelligence output for practitioners.
 */
export function buildSessionIntelligence(
  moonData: MoonData,
  zodiacPosition: ZodiacPosition
): SessionIntelligence {
  const phaseConfig = PHASES[moonData.phaseName];
  const zodiacConfig = ZODIAC_CONFIGS[zodiacPosition.signName];
  const lunarDistance = getLunarDistance(moonData.distance);

  // Combine frequencies from phase + zodiac bonus
  const frequencies = buildFrequencyList(phaseConfig.frequencies, zodiacConfig);

  // Combine instruments (union of phase + zodiac, deduplicated)
  const instruments = deduplicateStrings([
    ...phaseConfig.instruments,
    ...zodiacConfig.instruments,
  ]);

  // Combine things to avoid
  const avoid = [
    ...phaseConfig.avoid,
    ...zodiacConfig.avoidInstruments,
  ];

  // Build combined session guidance
  const sessionGuidance = buildGuidanceText(
    phaseConfig,
    zodiacConfig,
    lunarDistance,
    moonData
  );

  return {
    phase: phaseConfig,
    phaseName: moonData.phaseName,
    zodiac: zodiacConfig,
    zodiacSignName: zodiacPosition.signName,
    frequencies,
    instruments,
    avoid,
    sessionGuidance,
    lunarDistance,
    isWaxing: isWaxing(moonData.phase),
    subtitle: phaseConfig.subtitle,
    quote: phaseConfig.quote,
    moonTone: { ...MOON_TONE },
  };
}

// ── Frequency List Builder ──────────────────

function buildFrequencyList(
  phaseFrequencies: FrequencyPrescription[],
  zodiacConfig: typeof ZODIAC_CONFIGS[keyof typeof ZODIAC_CONFIGS]
): FrequencyPrescription[] {
  const frequencies = [...phaseFrequencies];

  // Add zodiac bonus frequency if not already present
  const hasBonus = frequencies.some((f) => f.hz === zodiacConfig.frequencyBonus);
  if (!hasBonus) {
    frequencies.push({
      hz: zodiacConfig.frequencyBonus,
      label: `${zodiacConfig.frequencyBonusLabel} (${zodiacConfig.name} bonus)`,
      type: 'secondary',
    });
  }

  return frequencies;
}

// ── Guidance Text Builder ───────────────────

function buildGuidanceText(
  phase: typeof PHASES[keyof typeof PHASES],
  zodiac: typeof ZODIAC_CONFIGS[keyof typeof ZODIAC_CONFIGS],
  distance: LunarDistance,
  moonData: MoonData
): string {
  const parts: string[] = [];

  // Phase energy
  parts.push(
    `The ${phase.name} in ${zodiac.name} brings ${phase.energy.toLowerCase()} energy` +
    ` meeting ${zodiac.element.toLowerCase()} ${zodiac.quality.toLowerCase()} influence.`
  );

  // Zodiac mood
  parts.push(zodiac.sessionMood);

  // Distance modifier
  if (distance.isSupermoon) {
    parts.push(
      'The moon is at perigee — exceptionally close to Earth. Expect amplified emotional intensity. ' +
      'Sessions may feel more potent than usual.'
    );
  } else if (distance.isMicromoon) {
    parts.push(
      'The moon is near apogee — distant and reflective. ' +
      'A good time for contemplative, introspective work.'
    );
  }

  // Waxing/waning context
  if (isWaxing(moonData.phase)) {
    parts.push('Energy is building. Focus on growth, activation, and amplification.');
  } else if (moonData.phase > 0.525) {
    parts.push('Energy is releasing. Focus on integration, surrender, and letting go.');
  }

  return parts.join(' ');
}

// ── Utilities ───────────────────────────────

function deduplicateStrings(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
