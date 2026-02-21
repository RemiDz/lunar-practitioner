'use client';

import GlassCard from './GlassCard';

interface LunarDistanceCardProps {
  km: number;
  normalised: number;
  label: string;
  isSupermoon: boolean;
  isMicromoon: boolean;
  phaseColour: string;
}

export default function LunarDistanceCard({
  km,
  normalised,
  label,
  isSupermoon,
  isMicromoon,
  phaseColour,
}: LunarDistanceCardProps) {
  return (
    <GlassCard label="Lunar Distance" accentColour={phaseColour}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-xl text-selenite-white">
          {km.toLocaleString()}
        </span>
        <span className="text-xs text-moonsilver/50">km</span>

        {isSupermoon && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono bg-lunar-gold/20 text-lunar-gold border border-lunar-gold/30">
            Supermoon
          </span>
        )}
        {isMicromoon && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono bg-moonsilver/10 text-moonsilver/70 border border-moonsilver/20">
            Micromoon
          </span>
        )}
      </div>

      <p className="text-xs text-moonsilver/50 mb-4">{label}</p>

      {/* Progress bar: perigee ↔ apogee */}
      <div className="relative">
        <div className="h-1 rounded-full bg-moonsilver/10" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-selenite-white shadow-[0_0_8px_rgba(240,238,248,0.4)] transition-all duration-1000"
          style={{ left: `calc(${normalised * 100}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-moonsilver/40 font-mono">Perigee</span>
        <span className="text-[10px] text-moonsilver/40 font-mono">Apogee</span>
      </div>
    </GlassCard>
  );
}
