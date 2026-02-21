'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CalendarDayData } from '@/hooks/useCalendarData';
import { getPhaseColour } from '@/lib/colour-utils';
import { ZODIAC_CONFIGS } from '@/data/zodiac';

interface DayDetailModalProps {
  day: CalendarDayData | null;
  onClose: () => void;
}

export default function DayDetailModal({ day, onClose }: DayDetailModalProps) {
  return (
    <AnimatePresence>
      {day && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-void-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#0D0D25]/95 backdrop-blur-md border border-moonsilver/15 rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-moonsilver/50 hover:text-selenite-white transition-colors text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>

            <DayDetailContent day={day} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DayDetailContent({ day }: { day: CalendarDayData }) {
  const intel = day.intelligence;
  const moon = day.moonData;
  const phaseColour = intel?.phase.colour || getPhaseColour(moon.phase);

  const dateStr = day.date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const zodiacConfig = day.zodiacPosition
    ? ZODIAC_CONFIGS[day.zodiacPosition.signName]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-2">
          {dateStr}
        </p>
        <h2 className="font-display text-3xl text-selenite-white font-light">
          {moon.phaseDisplayName}
        </h2>
        {zodiacConfig && (
          <p className="font-display text-lg text-lunar-gold italic mt-1">
            {zodiacConfig.symbol} {zodiacConfig.name} · {zodiacConfig.element}
          </p>
        )}
        <p className="font-mono text-sm text-moonsilver/60 mt-2">
          {moon.illuminationPercent} illuminated
        </p>
      </div>

      {/* Divider */}
      <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${phaseColour}, transparent)` }} />

      {intel && (
        <>
          {/* Energy */}
          <div>
            <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-2">
              Phase Energy
            </p>
            <p className="text-sm text-selenite-white/80">{intel.phase.energy}</p>
          </div>

          {/* Ideal for */}
          <div>
            <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-2">
              Ideal For
            </p>
            <ul className="space-y-1">
              {intel.phase.idealFor.map((item) => (
                <li key={item} className="text-sm text-selenite-white/70 flex items-start gap-2">
                  <span className="text-lunar-gold/60 mt-0.5">&#9670;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Frequencies */}
          <div>
            <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-2">
              Frequencies
            </p>
            <div className="flex flex-wrap gap-2">
              {intel.frequencies.map((f) => (
                <span
                  key={f.hz}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono border border-moonsilver/10 text-moonsilver/70"
                  style={{ borderColor: f.type === 'primary' ? phaseColour + '40' : undefined }}
                >
                  {f.hz} Hz
                </span>
              ))}
            </div>
          </div>

          {/* Zodiac influence */}
          {zodiacConfig && (
            <div>
              <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-2">
                Zodiac Influence
              </p>
              <p className="text-sm text-selenite-white/70">{zodiacConfig.sessionMood}</p>
            </div>
          )}

          {/* Instruments */}
          <div>
            <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-2">
              Instruments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {intel.instruments.map((inst) => (
                <span
                  key={inst}
                  className="px-2 py-0.5 rounded-full text-xs bg-moonsilver/5 text-moonsilver/70 border border-moonsilver/10"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {day.isNewMoon && (
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-deep/30 text-moonsilver border border-indigo-deep/50">
            New Moon
          </span>
        )}
        {day.isFullMoon && (
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-lunar-gold/15 text-lunar-gold border border-lunar-gold/25">
            Full Moon
          </span>
        )}
        {day.isSupermoon && (
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-lunar-gold/20 text-lunar-gold border border-lunar-gold/30 shadow-[0_0_8px_rgba(232,201,122,0.2)]">
            Supermoon
          </span>
        )}
      </div>
    </div>
  );
}
