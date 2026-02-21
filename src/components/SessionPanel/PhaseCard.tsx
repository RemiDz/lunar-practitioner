'use client';

import GlassCard from './GlassCard';

interface PhaseCardProps {
  phaseName: string;
  energy: string;
  idealFor: string[];
  avoid: string[];
  phaseColour: string;
}

export default function PhaseCard({
  phaseName,
  energy,
  idealFor,
  avoid,
  phaseColour,
}: PhaseCardProps) {
  return (
    <GlassCard label="Phase Energy" accentColour={phaseColour}>
      <h3
        className="font-display text-xl font-light mb-2 transition-colors duration-1000"
        style={{ color: phaseColour }}
      >
        {phaseName}
      </h3>
      <p className="text-moonsilver/70 text-sm mb-4">{energy}</p>

      {/* Ideal for */}
      <div className="mb-3">
        <p className="text-xs text-selenite-white/80 font-mono tracking-wider uppercase mb-2">
          Ideal for
        </p>
        <ul className="space-y-1">
          {idealFor.map((item) => (
            <li key={item} className="text-sm text-selenite-white/90 flex items-start gap-2">
              <span className="text-lunar-gold mt-0.5 text-xs">&#9672;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Avoid */}
      <div>
        <p className="text-xs text-moonsilver/50 font-mono tracking-wider uppercase mb-2">
          Avoid
        </p>
        <ul className="space-y-1">
          {avoid.map((item) => (
            <li key={item} className="text-sm text-moonsilver/50 flex items-start gap-2">
              <span className="mt-0.5 text-xs">&#9673;</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}
