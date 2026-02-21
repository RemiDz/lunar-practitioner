'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { STAGGER_CARD_DELAY } from '@/lib/motion-constants';
import { getPhaseColour } from '@/lib/colour-utils';
import type {
  SessionIntelligence,
  MoonData,
  LunarDistance,
} from '@/types/lunar';

import GlassCard from './GlassCard';
import PhaseCard from './PhaseCard';
import FrequencyCard from './FrequencyCard';
import ZodiacCard from './ZodiacCard';
import MoonTimesCard from './MoonTimesCard';
import LunarDistanceCard from './LunarDistanceCard';
import PhaseCountdownCard from './PhaseCountdownCard';

interface SessionPanelProps {
  intelligence: SessionIntelligence | null;
  moonData: MoonData | null;
  lunarDistance: LunarDistance | null;
  isLoading: boolean;
  userInstruments?: string[];
  playTone?: (hz: number) => void;
  stopTone?: () => void;
  activeToneHz?: number | null;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_CARD_DELAY,
      delayChildren: 0.1,
    },
  },
};

export default function SessionPanel({
  intelligence,
  moonData,
  lunarDistance,
  isLoading,
  userInstruments,
  playTone,
  stopTone,
  activeToneHz,
}: SessionPanelProps) {
  const showSkeleton = isLoading || !intelligence || !moonData;
  const phaseColour = intelligence?.phase.colour || (moonData ? getPhaseColour(moonData.phase) : '#C8C4DC');

  return (
    <AnimatePresence mode="wait">
      {showSkeleton ? (
        <motion.div
          key="skeleton"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard label="Phase Energy" skeleton />
          <GlassCard label="Frequencies" skeleton />
          <GlassCard label="Zodiac Influence" fullWidth skeleton />
          <GlassCard label="Moon Times" skeleton />
          <GlassCard label="Lunar Distance" skeleton />
          <GlassCard label="Phase Countdown" fullWidth skeleton />
        </motion.div>
      ) : (
    <motion.div
      key="content"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Row 1 */}
      <PhaseCard
        phaseName={intelligence.phase.name}
        energy={intelligence.phase.energy}
        idealFor={intelligence.phase.idealFor}
        avoid={intelligence.avoid}
        phaseColour={phaseColour}
      />
      <FrequencyCard
        frequencies={intelligence.frequencies}
        moonTone={intelligence.moonTone}
        phaseColour={phaseColour}
        playTone={playTone}
        stopTone={stopTone}
        activeToneHz={activeToneHz}
      />

      {/* Row 2: full width */}
      <ZodiacCard
        name={intelligence.zodiac.name}
        symbol={intelligence.zodiac.symbol}
        element={intelligence.zodiac.element}
        quality={intelligence.zodiac.quality}
        energy={intelligence.zodiac.energy}
        sessionMood={intelligence.zodiac.sessionMood}
        instruments={intelligence.instruments}
        phaseColour={phaseColour}
        userInstruments={userInstruments}
      />

      {/* Row 3 */}
      <MoonTimesCard
        moonrise={moonData.moonrise}
        moonset={moonData.moonset}
        alwaysUp={moonData.alwaysUp}
        alwaysDown={moonData.alwaysDown}
        isAboveHorizon={moonData.isAboveHorizon}
        phaseColour={phaseColour}
      />
      <LunarDistanceCard
        km={lunarDistance?.km ?? Math.round(moonData.distance)}
        normalised={lunarDistance?.normalised ?? 0.5}
        label={lunarDistance?.label ?? 'Calculating...'}
        isSupermoon={lunarDistance?.isSupermoon ?? false}
        isMicromoon={lunarDistance?.isMicromoon ?? false}
        phaseColour={phaseColour}
      />

      {/* Row 4: full width */}
      <PhaseCountdownCard
        moonPhase={moonData.phase}
        phaseColour={phaseColour}
      />
    </motion.div>
      )}
    </AnimatePresence>
  );
}
