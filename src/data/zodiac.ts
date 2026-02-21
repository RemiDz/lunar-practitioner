import type { ZodiacSignName, ZodiacConfig } from '@/types/lunar';

export const ZODIAC_CONFIGS: Record<ZodiacSignName, ZodiacConfig> = {
  ARIES: {
    name: 'Aries',
    symbol: '\u2648',
    element: 'Fire',
    quality: 'Cardinal',
    energy: 'Initiating, bold, fiery, courageous',
    sessionMood:
      'Ignite the room. This moon favours activation, movement, and primal expression.',
    idealFor: [
      'Activating sound journeys',
      'Drumming circles',
      'Movement-based sound healing',
      'Breathwork with percussive sound',
    ],
    instruments: ['Drums', 'Rattles', 'Didgeridoo', 'Large gong'],
    avoidInstruments: ['Gentle chimes — too soft for this energy'],
    frequencyBonus: 417,
    frequencyBonusLabel: 'Facilitating change (RE)',
  },

  TAURUS: {
    name: 'Taurus',
    symbol: '\u2649',
    element: 'Earth',
    quality: 'Fixed',
    energy: 'Grounding, sensual, steady, embodied',
    sessionMood:
      'Slow and lush. Ground the body deeply. This moon wants to be felt, not rushed.',
    idealFor: [
      'Grounding sound baths',
      'Body-focused sessions',
      'Nature-connected sound work',
      'Sensory-rich experiences',
    ],
    instruments: ['Crystal singing bowls', 'Monochord', 'Handpan', 'Earth gong'],
    avoidInstruments: ['Harsh or jarring tones — this energy craves beauty'],
    frequencyBonus: 174,
    frequencyBonusLabel: 'Foundation',
  },

  GEMINI: {
    name: 'Gemini',
    symbol: '\u264A',
    element: 'Air',
    quality: 'Mutable',
    energy: 'Curious, communicative, dual, playful',
    sessionMood:
      'Light and varied. Mix textures, alternate instruments, keep the mind engaged.',
    idealFor: [
      'Multi-instrument sound journeys',
      'Guided vocal toning',
      'Interactive group sessions',
      'Storytelling with sound',
    ],
    instruments: ['Chimes', 'Kalimba', 'Multiple small bowls', 'Voice'],
    avoidInstruments: ['Single sustained drones — this energy needs variety'],
    frequencyBonus: 741,
    frequencyBonusLabel: 'Expression (SOL)',
  },

  CANCER: {
    name: 'Cancer',
    symbol: '\u264B',
    element: 'Water',
    quality: 'Cardinal',
    energy: 'Nurturing, emotional, protective, intuitive',
    sessionMood:
      'Create a womb of sound. Nurture, hold, protect. Emotions will surface — let them.',
    idealFor: [
      'Nurturing sound baths',
      'Emotional processing sessions',
      'Mother-child bonding sound work',
      'Heart-opening practices',
    ],
    instruments: ['Crystal singing bowls', 'Ocean drum', 'Monochord', 'Shruti box'],
    avoidInstruments: ['Aggressive percussion — too jarring for emotional work'],
    frequencyBonus: 639,
    frequencyBonusLabel: 'Connecting (FA)',
  },

  LEO: {
    name: 'Leo',
    symbol: '\u264C',
    element: 'Fire',
    quality: 'Fixed',
    energy: 'Radiant, confident, creative, generous',
    sessionMood:
      'Let it shine. Encourage self-expression, creative toning, and joyful movement.',
    idealFor: [
      'Creative expression sessions',
      'Group toning and mantra',
      'Celebratory sound ceremonies',
      'Performance and sharing circles',
    ],
    instruments: ['Gong', 'Large crystal bowls', 'Drums', 'Voice'],
    avoidInstruments: ['Overly subtle instruments — this energy wants presence'],
    frequencyBonus: 528,
    frequencyBonusLabel: 'Transformation (MI)',
  },

  VIRGO: {
    name: 'Virgo',
    symbol: '\u264D',
    element: 'Earth',
    quality: 'Mutable',
    energy: 'Precise, healing, analytical, service-oriented',
    sessionMood:
      'Precision healing. Focus on specific body areas, detailed frequency work, refined technique.',
    idealFor: [
      'Targeted frequency healing',
      'Tuning fork sessions',
      'Body scanning with sound',
      'Detailed chakra work',
    ],
    instruments: ['Tuning forks', 'Crystal singing bowls (specific notes)', 'Tibetan bowls', 'Monochord'],
    avoidInstruments: ['Chaotic layering — this energy needs clarity'],
    frequencyBonus: 285,
    frequencyBonusLabel: 'Healing tissue',
  },

  LIBRA: {
    name: 'Libra',
    symbol: '\u264E',
    element: 'Air',
    quality: 'Cardinal',
    energy: 'Harmonious, balanced, relational, aesthetic',
    sessionMood:
      'Seek balance. Pair instruments, create harmonic intervals, beauty above all.',
    idealFor: [
      'Harmonic sound baths',
      'Partner sound healing',
      'Aesthetic ceremony design',
      'Balancing chakra work',
    ],
    instruments: ['Crystal singing bowls (paired)', 'Chimes', 'Harp', 'Handpan'],
    avoidInstruments: ['Dissonant or harsh tones — this energy seeks harmony'],
    frequencyBonus: 639,
    frequencyBonusLabel: 'Connecting (FA)',
  },

  SCORPIO: {
    name: 'Scorpio',
    symbol: '\u264F',
    element: 'Water',
    quality: 'Fixed',
    energy: 'Depth, transformation, shadow integration, catharsis',
    sessionMood:
      'Go deep. This is a moon for shadow work, not comfort. Allow catharsis.',
    idealFor: [
      'Shadow integration',
      'Trauma-release sound baths',
      'Cathartic breathwork',
      'Deep gong immersions',
    ],
    instruments: ['Gong', 'Didgeridoo', 'Low crystal bowls', 'Drum'],
    avoidInstruments: ['High-pitched bells — too light for this energy'],
    frequencyBonus: 396,
    frequencyBonusLabel: 'Liberation (UT)',
  },

  SAGITTARIUS: {
    name: 'Sagittarius',
    symbol: '\u2650',
    element: 'Fire',
    quality: 'Mutable',
    energy: 'Expansive, philosophical, adventurous, visionary',
    sessionMood:
      'Expand the field. Take the group on a journey. Think big, explore widely.',
    idealFor: [
      'Sound journeys with narrative',
      'Expansive gong baths',
      'Vision quest sound work',
      'Cross-cultural instrument fusion',
    ],
    instruments: ['Gong', 'Didgeridoo', 'Drums (varied)', 'Singing bowls'],
    avoidInstruments: ['Repetitive single-note work — this energy needs expansion'],
    frequencyBonus: 852,
    frequencyBonusLabel: 'Intuition (LA)',
  },

  CAPRICORN: {
    name: 'Capricorn',
    symbol: '\u2651',
    element: 'Earth',
    quality: 'Cardinal',
    energy: 'Structured, disciplined, grounding, ambitious',
    sessionMood:
      'Structure the session. Clear intention, steady rhythm, purposeful progression.',
    idealFor: [
      'Structured sound healing sessions',
      'Grounding practices',
      'Bone and joint focused work',
      'Discipline-building meditation',
    ],
    instruments: ['Tibetan singing bowls', 'Monochord', 'Tuning forks', 'Frame drum'],
    avoidInstruments: ['Freestyle or chaotic layering — this energy needs structure'],
    frequencyBonus: 174,
    frequencyBonusLabel: 'Foundation',
  },

  AQUARIUS: {
    name: 'Aquarius',
    symbol: '\u2652',
    element: 'Air',
    quality: 'Fixed',
    energy: 'Innovative, humanitarian, electric, unconventional',
    sessionMood:
      'Experiment. Try unusual combinations, electronic elements, group coherence fields.',
    idealFor: [
      'Experimental sound sessions',
      'Group coherence practices',
      'Electronic-acoustic fusion',
      'Sound and technology integration',
    ],
    instruments: ['Synthesizer', 'Crystal bowls', 'Gong', 'Unconventional sound sources'],
    avoidInstruments: ['Overly traditional or rigid approaches'],
    frequencyBonus: 963,
    frequencyBonusLabel: 'Divine connection (TI)',
  },

  PISCES: {
    name: 'Pisces',
    symbol: '\u2653',
    element: 'Water',
    quality: 'Mutable',
    energy: 'Dreamy, spiritual, dissolving, transcendent',
    sessionMood:
      'Dissolve boundaries. This is the most spiritual moon. Let sound become prayer.',
    idealFor: [
      'Deep meditation sound baths',
      'Yoga Nidra with sound',
      'Spiritual ceremony',
      'Shamanic journeying',
    ],
    instruments: ['Ocean drum', 'Crystal singing bowls', 'Monochord', 'Shruti box', 'Voice'],
    avoidInstruments: ['Sharp or percussive sounds — this energy needs to float'],
    frequencyBonus: 963,
    frequencyBonusLabel: 'Divine connection (TI)',
  },
};

/** Ordered zodiac signs starting from Aries (0° ecliptic) */
export const ZODIAC_ORDER: ZodiacSignName[] = [
  'ARIES',
  'TAURUS',
  'GEMINI',
  'CANCER',
  'LEO',
  'VIRGO',
  'LIBRA',
  'SCORPIO',
  'SAGITTARIUS',
  'CAPRICORN',
  'AQUARIUS',
  'PISCES',
];
