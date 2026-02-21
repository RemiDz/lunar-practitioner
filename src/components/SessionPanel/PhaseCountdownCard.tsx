'use client';

import { useMemo } from 'react';
import GlassCard from './GlassCard';
import {
  getNextPhaseTransition,
  formatTimeUntil,
  getPhaseProgress,
} from '@/lib/moon-calculations';

interface PhaseCountdownCardProps {
  moonPhase: number;
  phaseColour: string;
}

export default function PhaseCountdownCard({
  moonPhase,
  phaseColour,
}: PhaseCountdownCardProps) {
  const nextTransition = useMemo(() => getNextPhaseTransition(), []);
  const progress = useMemo(() => getPhaseProgress(moonPhase), [moonPhase]);
  const progressPercent = Math.round(progress * 100);

  return (
    <GlassCard label="Phase Countdown" accentColour={phaseColour} fullWidth>
      <div className="md:flex md:items-center md:justify-between md:gap-6">
        <div className="mb-4 md:mb-0">
          <p className="text-xs text-moonsilver/50 mb-1">Next phase</p>
          <h3 className="font-display text-xl font-light text-selenite-white">
            {nextTransition.name}
          </h3>
          <p className="font-mono text-sm text-lunar-gold mt-1">
            {formatTimeUntil(nextTransition.hoursUntil)}
          </p>
        </div>

        <div className="flex-1 max-w-md">
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px] text-moonsilver/40 font-mono">
              Current phase progress
            </span>
            <span className="text-[10px] text-moonsilver/50 font-mono">
              {progressPercent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-moonsilver/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-in-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: phaseColour,
              }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
