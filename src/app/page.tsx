'use client';

import { useSessionIntelligence } from '@/hooks/useSessionIntelligence';
import { getLunarDistance } from '@/lib/moon-calculations';
import { getPhaseDirection } from '@/lib/moon-calculations';
import { ZODIAC_CONFIGS } from '@/data/zodiac';
import { MoonCanvas } from '@/components/MoonCanvas';
import { SessionPanel } from '@/components/SessionPanel';

export default function Home() {
  const { intelligence, moonData, zodiacPosition, isLoading } =
    useSessionIntelligence();

  const lunarDistance = moonData ? getLunarDistance(moonData.distance) : null;
  const zodiacConfig = zodiacPosition
    ? ZODIAC_CONFIGS[zodiacPosition.signName]
    : null;

  return (
    <main className="min-h-screen bg-void-black text-selenite-white font-body">
      {/* ── Zone 1: Live Indicator Bar ────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-void-black/70 border-b border-moonsilver/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            {/* Pulsing live dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lunar-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lunar-gold" />
            </span>
            <span className="font-mono text-moonsilver text-xs tracking-wider uppercase">
              Live
            </span>
          </div>

          {isLoading ? (
            <span className="text-moonsilver/50 font-mono text-xs">
              Calculating...
            </span>
          ) : (
            <div className="flex items-center gap-4 text-xs font-mono">
              {moonData && (
                <>
                  <span className="text-selenite-white">
                    {moonData.phaseDisplayName}
                  </span>
                  <span className="text-moonsilver">
                    {moonData.illuminationPercent}
                  </span>
                </>
              )}
              {zodiacConfig && (
                <span className="text-lunar-gold">
                  {zodiacConfig.symbol} {zodiacConfig.name}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Zone 2: Moon Canvas (45vh) ────────────── */}
      <section className="relative w-full" style={{ height: '45vh', minHeight: 320 }}>
        <MoonCanvas moonData={moonData} zodiacPosition={zodiacPosition} />
      </section>

      {/* ── Zone 3: Phase Identity ─────────────────── */}
      <section className="max-w-2xl mx-auto px-6 py-10 text-center">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 w-48 bg-moonsilver/10 rounded mx-auto" />
            <div className="h-4 w-64 bg-moonsilver/10 rounded mx-auto" />
          </div>
        ) : intelligence && moonData ? (
          <div className="space-y-4">
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-wide text-selenite-white">
              {moonData.phaseDisplayName}
            </h1>
            <p className="font-display text-lg text-lunar-gold italic">
              {intelligence.subtitle}
            </p>
            <p className="text-moonsilver/70 text-sm font-mono">
              {getPhaseDirection(moonData.phase)}
              {lunarDistance?.isSupermoon && ' · Supermoon'}
              {lunarDistance?.isMicromoon && ' · Micromoon'}
            </p>
            <blockquote className="text-moonsilver text-base font-display italic leading-relaxed mt-6 px-4">
              &ldquo;{intelligence.quote}&rdquo;
            </blockquote>
          </div>
        ) : null}
      </section>

      {/* ── Zone 4: Session Intelligence Panel ─────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <SessionPanel
          intelligence={intelligence}
          moonData={moonData}
          lunarDistance={lunarDistance}
          isLoading={isLoading}
        />
      </section>
    </main>
  );
}
