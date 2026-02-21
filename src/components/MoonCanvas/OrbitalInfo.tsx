'use client';

import type { MoonData, ZodiacPosition } from '@/types/lunar';
import { ZODIAC_CONFIGS } from '@/data/zodiac';
import { getPhaseDirection } from '@/lib/moon-calculations';

interface OrbitalInfoProps {
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
}

export default function OrbitalInfo({ moonData, zodiacPosition }: OrbitalInfoProps) {
  if (!moonData) return null;

  const phase = moonData.phase;
  const illumPct = moonData.illuminationPercent;
  const config = zodiacPosition ? ZODIAC_CONFIGS[zodiacPosition.signName] : null;
  const direction = getPhaseDirection(phase);
  const circumference = 2 * Math.PI * 170;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Phase arc ring — SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {/* Track */}
        <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(200,196,220,0.04)" strokeWidth="1" />
        {/* Quarter tick marks */}
        {[0, 0.25, 0.5, 0.75].map((p, i) => {
          const a = -Math.PI / 2 + p * Math.PI * 2;
          return (
            <line
              key={i}
              x1={200 + 163 * Math.cos(a)} y1={200 + 163 * Math.sin(a)}
              x2={200 + 177 * Math.cos(a)} y2={200 + 177 * Math.sin(a)}
              stroke="rgba(200,196,220,0.12)" strokeWidth="1"
            />
          );
        })}
        {/* Progress arc */}
        <circle
          cx="200" cy="200" r="170" fill="none"
          stroke="rgba(200,196,220,0.2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${phase * circumference} ${circumference - phase * circumference}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: 'stroke-dasharray 2s ease', filter: 'drop-shadow(0 0 3px rgba(200,196,220,0.15))' }}
        />
        {/* Endpoint dot */}
        <circle
          cx={200 + 170 * Math.cos(-Math.PI / 2 + phase * Math.PI * 2)}
          cy={200 + 170 * Math.sin(-Math.PI / 2 + phase * Math.PI * 2)}
          r="3" fill="#E8C97A"
          style={{ filter: 'drop-shadow(0 0 4px rgba(232,201,122,0.6))' }}
        >
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Top label */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 text-center">
        <span className="font-mono text-[10px] tracking-[0.2em] text-moonsilver/30 uppercase">
          Lunar Phase
        </span>
      </div>

      {/* Left — Illumination */}
      <div className="absolute top-1/2 left-[2%] -translate-y-1/2 text-left">
        <div className="font-mono text-[9px] tracking-[0.15em] text-moonsilver/30 uppercase mb-1">
          Illumination
        </div>
        <div className="font-display text-[28px] text-selenite-white font-light leading-none">
          {illumPct}
        </div>
      </div>

      {/* Right — Zodiac */}
      {config && (
        <div className="absolute top-1/2 right-[2%] -translate-y-1/2 text-right">
          <div className="font-mono text-[9px] tracking-[0.15em] text-moonsilver/30 uppercase mb-1">
            Zodiac Transit
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="font-display text-[24px] text-selenite-white font-light">
              {config.name}
            </span>
            <span className="text-[20px] text-lunar-gold">
              {config.symbol}
            </span>
          </div>
        </div>
      )}

      {/* Bottom — Direction */}
      <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 text-center">
        <span className="font-mono text-[9px] tracking-[0.12em] text-moonsilver/25">
          {direction}
        </span>
      </div>
    </div>
  );
}
