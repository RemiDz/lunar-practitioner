'use client';

import GlassCard from './GlassCard';
import type { FrequencyPrescription } from '@/types/lunar';

interface FrequencyCardProps {
  frequencies: FrequencyPrescription[];
  moonTone: { hz: number; note: string; label: string };
  phaseColour: string;
}

const TYPE_ORDER: FrequencyPrescription['type'][] = ['primary', 'secondary', 'planetary'];

export default function FrequencyCard({
  frequencies,
  moonTone,
  phaseColour,
}: FrequencyCardProps) {
  const sorted = [...frequencies].sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
  );

  return (
    <GlassCard label="Frequencies" accentColour={phaseColour}>
      <div className="space-y-3">
        {sorted.map((freq) => {
          const isMoonTone = freq.hz === moonTone.hz;
          return (
            <div
              key={`${freq.hz}-${freq.type}`}
              className={`flex items-baseline gap-3 ${
                isMoonTone ? 'border-l-2 border-lunar-gold pl-3 -ml-3' : ''
              }`}
            >
              <span className="font-mono text-lg text-selenite-white">
                {freq.hz}
                <span className="text-xs text-moonsilver/50 ml-0.5">Hz</span>
              </span>
              <span className="text-sm text-moonsilver">{freq.label}</span>
            </div>
          );
        })}
      </div>

      {/* Moon tone note */}
      <p className="mt-4 text-xs text-lunar-gold/70 font-mono">
        Moon tone: {moonTone.hz} Hz ({moonTone.note})
      </p>
    </GlassCard>
  );
}
