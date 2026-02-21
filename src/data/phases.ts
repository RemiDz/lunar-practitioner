import type { PhaseName, PhaseConfig } from '@/types/lunar';

export const PHASES: Record<PhaseName, PhaseConfig> = {
  NEW_MOON: {
    name: 'New Moon',
    subtitle: 'Void & Beginning',
    quote: 'The dark before the light. Plant seeds here.',
    energy: 'Inward, still, potent with potential',
    idealFor: [
      'Intention setting',
      'Silent meditation',
      'Vision work',
      'Yin sound baths',
      'Journaling and reflection',
    ],
    avoid: [
      'High-energy activations',
      'Loud percussive work',
      'Large group sessions',
    ],
    frequencies: [
      { hz: 396, label: 'Liberation (UT)', type: 'primary' },
      { hz: 174, label: 'Foundation', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Monochord', 'Crystal singing bowls (low)', 'Shruti box', 'Ocean drum'],
    colour: '#1A1A4E',
  },

  WAXING_CRESCENT: {
    name: 'Waxing Crescent',
    subtitle: 'Emergence & Intention',
    quote: 'A sliver of light appears. Let your intentions take shape.',
    energy: 'Tentative, hopeful, gathering momentum',
    idealFor: [
      'Setting intentions with sound',
      'Gentle activation practices',
      'Breathwork with toning',
      'Small group work',
    ],
    avoid: [
      'Release or letting-go practices',
      'Heavy emotional processing',
    ],
    frequencies: [
      { hz: 417, label: 'Facilitating change (RE)', type: 'primary' },
      { hz: 285, label: 'Healing tissue', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Crystal singing bowls', 'Chimes', 'Kalimba', 'Handpan'],
    colour: '#8B7EC8',
  },

  FIRST_QUARTER: {
    name: 'First Quarter',
    subtitle: 'Action & Decision',
    quote: 'Half-lit, half-shadowed. Commit to the path.',
    energy: 'Dynamic, decisive, tension between old and new',
    idealFor: [
      'Activating sound journeys',
      'Rhythmic drumming circles',
      'Movement with sound',
      'Overcoming resistance',
    ],
    avoid: [
      'Purely passive practices',
      'Avoiding conflict or tension in sessions',
    ],
    frequencies: [
      { hz: 528, label: 'Transformation (MI)', type: 'primary' },
      { hz: 417, label: 'Facilitating change (RE)', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Drums', 'Rattles', 'Crystal bowls (mid-range)', 'Didgeridoo'],
    colour: '#8B7EC8',
  },

  WAXING_GIBBOUS: {
    name: 'Waxing Gibbous',
    subtitle: 'Refinement & Trust',
    quote: 'The moon is building power. So is your work.',
    energy: 'Building, refining, almost full, anticipatory',
    idealFor: [
      'Intensifying intention',
      'Deepening breathwork',
      'Building group field',
      'Sustained toning',
      'Layered sound baths',
    ],
    avoid: [
      'Completion work',
      'Release practices — save those for after the full moon',
    ],
    frequencies: [
      { hz: 528, label: 'Transformation (MI)', type: 'primary' },
      { hz: 741, label: 'Expression (SOL)', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Crystal singing bowls', 'Gong (building)', 'Monochord', 'Voice'],
    colour: '#8B7EC8',
  },

  FULL_MOON: {
    name: 'Full Moon',
    subtitle: 'Peak Illumination',
    quote: 'Maximum light. Maximum feeling. Hold nothing back.',
    energy: 'Expansive, emotional, powerful, culminating',
    idealFor: [
      'Group sound journeys',
      'Gong baths',
      'Emotional release',
      'Toning and mantra',
      'Ceremony',
      'Full moon circles',
    ],
    avoid: [
      'Quiet introspective work — energy is too high',
      'Detailed planning — feel instead',
    ],
    frequencies: [
      { hz: 432, label: 'Universal harmony', type: 'primary' },
      { hz: 528, label: 'Transformation (MI)', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Gong', 'Large crystal bowls', 'Drums', 'Voice', 'All instruments welcome'],
    colour: '#E8C97A',
  },

  WANING_GIBBOUS: {
    name: 'Waning Gibbous',
    subtitle: 'Gratitude & Integration',
    quote: 'The peak has passed. Gather what you have learned.',
    energy: 'Reflective, grateful, integrating, still strong',
    idealFor: [
      'Integration sound baths',
      'Gratitude practices',
      'Sharing circles with sound',
      'Gentle gong work',
    ],
    avoid: [
      'Starting new projects or intentions',
      'High-activation practices',
    ],
    frequencies: [
      { hz: 639, label: 'Connecting (FA)', type: 'primary' },
      { hz: 528, label: 'Transformation (MI)', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Crystal bowls', 'Monochord', 'Singing bowls (Tibetan)', 'Chimes'],
    colour: '#C87E8B',
  },

  LAST_QUARTER: {
    name: 'Last Quarter',
    subtitle: 'Release & Forgiveness',
    quote: 'Half-dark again. Let go of what no longer serves.',
    energy: 'Releasing, cleansing, making space',
    idealFor: [
      'Release ceremonies',
      'Forgiveness practices',
      'Sound clearing',
      'Cutting-cord meditations with sound',
    ],
    avoid: [
      'Building or amplifying energy',
      'Starting new group work',
    ],
    frequencies: [
      { hz: 741, label: 'Expression & cleansing (SOL)', type: 'primary' },
      { hz: 852, label: 'Intuition (LA)', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Rattles', 'Drums', 'Didgeridoo', 'Tibetan singing bowls'],
    colour: '#C87E8B',
  },

  WANING_CRESCENT: {
    name: 'Waning Crescent',
    subtitle: 'Surrender & Rest',
    quote: 'Almost dark. Surrender. The void is near.',
    energy: 'Surrendering, resting, preparing for renewal',
    idealFor: [
      'Deep rest sound baths',
      'Yoga Nidra with sound',
      'Silence and stillness',
      'Solo practice',
      'Restorative sessions',
    ],
    avoid: [
      'Stimulating practices',
      'Large group work',
      'Goal-setting — wait for the new moon',
    ],
    frequencies: [
      { hz: 963, label: 'Divine connection (TI)', type: 'primary' },
      { hz: 174, label: 'Foundation', type: 'secondary' },
      { hz: 210.42, label: 'Moon planetary tone', type: 'planetary' },
    ],
    instruments: ['Monochord', 'Shruti box', 'Crystal bowls (low)', 'Ocean drum', 'Silence'],
    colour: '#C87E8B',
  },
};

/** Ordered list of phase names for cycle progression */
export const PHASE_ORDER: PhaseName[] = [
  'NEW_MOON',
  'WAXING_CRESCENT',
  'FIRST_QUARTER',
  'WAXING_GIBBOUS',
  'FULL_MOON',
  'WANING_GIBBOUS',
  'LAST_QUARTER',
  'WANING_CRESCENT',
];
