'use client';

import GlassCard from './GlassCard';
import { getMoonDuration } from '@/lib/moon-calculations';

interface MoonTimesCardProps {
  moonrise: Date | null;
  moonset: Date | null;
  alwaysUp: boolean;
  alwaysDown: boolean;
  isAboveHorizon: boolean;
  phaseColour: string;
}

function formatTime(date: Date | null): string {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export default function MoonTimesCard({
  moonrise,
  moonset,
  alwaysUp,
  alwaysDown,
  isAboveHorizon,
  phaseColour,
}: MoonTimesCardProps) {
  const duration = getMoonDuration(moonrise, moonset);

  return (
    <GlassCard label="Moon Times" accentColour={phaseColour}>
      {/* Horizon status */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`h-2 w-2 rounded-full ${
            isAboveHorizon
              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
              : 'bg-moonsilver/30'
          }`}
        />
        <span className="text-xs text-moonsilver/60">
          {isAboveHorizon ? 'Above horizon' : 'Below horizon'}
        </span>
      </div>

      {alwaysUp ? (
        <p className="font-mono text-lg text-selenite-white">Does not set</p>
      ) : alwaysDown ? (
        <p className="font-mono text-lg text-selenite-white">Does not rise</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-moonsilver/50">Rise</span>
            <span className="font-mono text-lg text-selenite-white">
              {formatTime(moonrise)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-moonsilver/50">Set</span>
            <span className="font-mono text-lg text-selenite-white">
              {formatTime(moonset)}
            </span>
          </div>
          {duration && (
            <div className="flex items-baseline justify-between pt-2 border-t border-moonsilver/10">
              <span className="text-xs text-moonsilver/50">Duration</span>
              <span className="font-mono text-sm text-moonsilver">
                {duration}
              </span>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
