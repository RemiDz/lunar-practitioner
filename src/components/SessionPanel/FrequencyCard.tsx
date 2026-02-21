'use client';

import GlassCard from './GlassCard';
import type { FrequencyPrescription } from '@/types/lunar';

interface FrequencyCardProps {
  frequencies: FrequencyPrescription[];
  moonTone: { hz: number; note: string; label: string };
  phaseColour: string;
  playTone?: (hz: number) => void;
  stopTone?: () => void;
  activeToneHz?: number | null;
}

const TYPE_ORDER: FrequencyPrescription['type'][] = ['primary', 'secondary', 'planetary'];

export default function FrequencyCard({
  frequencies,
  moonTone,
  phaseColour,
  playTone,
  stopTone,
  activeToneHz,
}: FrequencyCardProps) {
  const sorted = [...frequencies].sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
  );

  return (
    <GlassCard label="Frequencies" accentColour={phaseColour}>
      <div className="space-y-3">
        {sorted.map((freq) => {
          const isMoonTone = freq.hz === moonTone.hz;
          const isPlaying = activeToneHz === freq.hz;
          return (
            <div
              key={`${freq.hz}-${freq.type}`}
              className={`flex items-center gap-3 ${
                isMoonTone ? 'border-l-2 border-lunar-gold pl-3 -ml-3' : ''
              }`}
            >
              <span className="font-mono text-lg text-selenite-white flex-shrink-0">
                {freq.hz}
                <span className="text-xs text-moonsilver/50 ml-0.5">Hz</span>
              </span>
              <span className="text-sm text-moonsilver flex-1">{freq.label}</span>
              {playTone && stopTone && (
                <button
                  onClick={() => isPlaying ? stopTone() : playTone(freq.hz)}
                  className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'border-lunar-gold/50 bg-lunar-gold/15 text-lunar-gold'
                      : 'border-moonsilver/20 text-moonsilver/40 hover:text-moonsilver/70 hover:border-moonsilver/40'
                  }`}
                  aria-label={isPlaying ? `Stop ${freq.hz} Hz` : `Play ${freq.hz} Hz`}
                >
                  {isPlaying ? (
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                      <rect x="1" y="1" width="8" height="8" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5 ml-0.5" viewBox="0 0 10 10" fill="currentColor">
                      <polygon points="2,0 10,5 2,10" />
                    </svg>
                  )}
                </button>
              )}
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
