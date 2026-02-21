'use client';

import GlassCard from './GlassCard';

interface ZodiacCardProps {
  name: string;
  symbol: string;
  element: string;
  quality: string;
  energy: string;
  sessionMood: string;
  instruments: string[];
  phaseColour: string;
}

const ELEMENT_COLOURS: Record<string, string> = {
  Fire: 'bg-red-900/30 text-red-300/80',
  Earth: 'bg-emerald-900/30 text-emerald-300/80',
  Air: 'bg-sky-900/30 text-sky-300/80',
  Water: 'bg-blue-900/30 text-blue-300/80',
};

export default function ZodiacCard({
  name,
  symbol,
  element,
  quality,
  energy,
  sessionMood,
  instruments,
  phaseColour,
}: ZodiacCardProps) {
  return (
    <GlassCard label="Zodiac Influence" accentColour={phaseColour} fullWidth>
      <div className="relative">
        {/* Watermark symbol */}
        <span className="absolute -top-2 right-0 text-[6rem] leading-none opacity-[0.05] font-display select-none pointer-events-none">
          {symbol}
        </span>

        <div className="md:grid md:grid-cols-2 md:gap-8">
          {/* Left column: sign info */}
          <div>
            <h3 className="font-display text-xl font-light text-selenite-white mb-1">
              <span className="mr-2">{symbol}</span>
              {name}
            </h3>
            <p className="text-moonsilver/60 text-sm mb-3">{energy}</p>

            {/* Element & Quality pills */}
            <div className="flex gap-2 mb-4">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono ${
                  ELEMENT_COLOURS[element] || 'bg-moonsilver/10 text-moonsilver'
                }`}
              >
                {element}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-moonsilver/10 text-moonsilver/70">
                {quality}
              </span>
            </div>
          </div>

          {/* Right column: session mood + instruments */}
          <div>
            <p className="text-xs text-moonsilver/50 font-mono tracking-wider uppercase mb-2">
              Session Mood
            </p>
            <p className="text-sm text-selenite-white/80 mb-4 leading-relaxed">
              {sessionMood}
            </p>

            <p className="text-xs text-moonsilver/50 font-mono tracking-wider uppercase mb-2">
              Instruments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {instruments.map((inst) => (
                <span
                  key={inst}
                  className="px-2 py-0.5 rounded-full text-xs bg-moonsilver/5 text-moonsilver/70 border border-moonsilver/10"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
