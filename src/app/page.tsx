'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useSessionIntelligence } from '@/hooks/useSessionIntelligence';
import { useAudio } from '@/hooks/useAudio';
import { getLunarDistance } from '@/lib/moon-calculations';
import { getPhaseDirection } from '@/lib/moon-calculations';
import { ZODIAC_CONFIGS } from '@/data/zodiac';
import { CosmicBackground } from '@/components/CosmicBackground';
import { MoonCanvas } from '@/components/MoonCanvas';
import OrbitalInfo from '@/components/MoonCanvas/OrbitalInfo';
import { SessionPanel } from '@/components/SessionPanel';
import { SettingsModal } from '@/components/Settings';
import { SessionCardGenerator } from '@/components/SessionCard';
import { LunarCalendar } from '@/components/Calendar';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { AudioControls } from '@/components/AudioControls';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function Home() {
  const {
    locationOverride,
    setLocationOverride,
    userInstruments,
    setUserInstruments,
    audioVolume,
    setAudioVolume,
    audioEnabled,
    setAudioEnabled,
  } = useSettings();

  const { intelligence, moonData, zodiacPosition, location, isLoading, error } =
    useSessionIntelligence(locationOverride);

  const {
    isInitialised: audioInitialised,
    isDroneActive,
    activeToneHz,
    volume,
    initAudio,
    toggleDrone,
    playTone,
    stopTone,
    setVolume,
  } = useAudio();

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync settings volume to audio engine
  useEffect(() => {
    setVolume(audioVolume);
  }, [audioVolume, setVolume]);

  const lunarDistance = moonData ? getLunarDistance(moonData.distance) : null;
  const zodiacConfig = zodiacPosition
    ? ZODIAC_CONFIGS[zodiacPosition.signName]
    : null;

  return (
    <>
      {/* Full-viewport fixed starfield behind everything */}
      <CosmicBackground />

      {/* All content scrolls over the cosmic background */}
      <main className="relative z-[1] min-h-screen text-selenite-white font-body">
        {/* ── HUD Header ────────────────────────── */}
        <header
          className="sticky top-0 z-50 border-b border-moonsilver/[0.06]"
          style={{
            background: 'linear-gradient(180deg, rgba(6,6,26,0.9) 0%, rgba(6,6,26,0.5) 100%)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lunar-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lunar-gold" style={{ boxShadow: '0 0 8px rgba(232,201,122,0.5)' }} />
              </span>
              <span className="font-mono text-moonsilver/50 text-[11px] tracking-[0.15em] uppercase">
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
                    <span className="text-selenite-white truncate">
                      {moonData.phaseDisplayName}
                    </span>
                    <span className="text-moonsilver/50 hidden sm:inline">
                      {moonData.illuminationPercent}
                    </span>
                  </>
                )}
                {zodiacConfig && (
                  <span className="text-lunar-gold hidden sm:inline">
                    {zodiacConfig.symbol} {zodiacConfig.name}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {audioEnabled && (
                <AudioControls
                  isInitialised={audioInitialised}
                  isDroneActive={isDroneActive}
                  volume={volume}
                  onInit={initAudio}
                  onToggleDrone={toggleDrone}
                  onVolumeChange={(v) => {
                    setVolume(v);
                    setAudioVolume(v);
                  }}
                />
              )}
              <button
                onClick={() => setSettingsOpen(true)}
                className="text-moonsilver/40 hover:text-selenite-white transition-colors p-2 flex-shrink-0"
                aria-label="Settings"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* ── Moon Hero Section ─────────────────── */}
        <section
          className="relative w-full flex items-center justify-center"
          style={{ height: '80vh', minHeight: 450 }}
        >
          <div className="relative" style={{ width: 'min(85vw, 420px)', height: 'min(85vw, 420px)' }}>
            {/* Moon orb canvas */}
            <div className="absolute inset-0 flex items-center justify-center">
              <MoonCanvas moonData={moonData} zodiacPosition={zodiacPosition} />
            </div>
            {/* Orbital data overlay */}
            <OrbitalInfo moonData={moonData} zodiacPosition={zodiacPosition} />
          </div>
        </section>

        {/* ── Phase Identity ────────────────────── */}
        <ScrollReveal>
          <section className="max-w-2xl mx-auto px-6 py-10 text-center" style={{ marginTop: -60 }}>
            {error ? (
              <ErrorDisplay
                mode="inline"
                error={error}
                onRetry={() => window.location.reload()}
              />
            ) : isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-8 w-48 bg-moonsilver/10 rounded mx-auto" />
                <div className="h-4 w-64 bg-moonsilver/10 rounded mx-auto" />
              </div>
            ) : intelligence && moonData ? (
              <div className="space-y-4">
                <h1 className="font-display text-4xl md:text-5xl font-light tracking-[0.06em] text-selenite-white">
                  {moonData.phaseDisplayName}
                </h1>
                <p className="font-display text-lg text-lunar-gold italic">
                  {intelligence.subtitle}
                </p>
                <p className="text-moonsilver/40 text-xs font-mono tracking-[0.08em]">
                  {getPhaseDirection(moonData.phase)}
                  {lunarDistance?.isSupermoon && ' · Supermoon'}
                  {lunarDistance?.isMicromoon && ' · Micromoon'}
                </p>
                <blockquote className="text-moonsilver/70 text-base font-display italic leading-relaxed mt-6 px-4">
                  &ldquo;{intelligence.quote}&rdquo;
                </blockquote>
              </div>
            ) : null}
          </section>
        </ScrollReveal>

        {/* ── Session Intelligence Panel ────────── */}
        <ScrollReveal delay={0.1}>
          <section className="max-w-3xl mx-auto px-6 pb-16">
            <SessionPanel
              intelligence={intelligence}
              moonData={moonData}
              lunarDistance={lunarDistance}
              isLoading={isLoading}
              userInstruments={userInstruments}
              playTone={audioEnabled ? playTone : undefined}
              stopTone={audioEnabled ? stopTone : undefined}
              activeToneHz={activeToneHz}
            />
          </section>
        </ScrollReveal>

        {/* ── Lunar Calendar ───────────────────── */}
        <ScrollReveal delay={0.2}>
          <section className="max-w-3xl mx-auto px-6 pb-20">
            <LunarCalendar
              latitude={location.latitude}
              longitude={location.longitude}
            />
          </section>
        </ScrollReveal>

        {/* ── Footer ──────────────────────────── */}
        <footer className="relative z-10 py-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(200,196,220,0.12), transparent)',
              }}
            />
            <p className="font-mono text-[10px] tracking-[0.2em] text-moonsilver/25 uppercase">
              Crafted by
            </p>
            <p className="font-display text-sm text-moonsilver/40 tracking-wide">
              Remigijus Dzingelevičius
            </p>
            <p className="font-mono text-[9px] tracking-[0.15em] text-moonsilver/15 uppercase mt-1">
              NestorLab · 2025
            </p>
          </div>
        </footer>

        {/* ── Settings Modal ───────────────────── */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          locationOverride={locationOverride}
          onLocationChange={setLocationOverride}
          userInstruments={userInstruments}
          onInstrumentsChange={setUserInstruments}
          audioVolume={audioVolume}
          onAudioVolumeChange={setAudioVolume}
          audioEnabled={audioEnabled}
          onAudioEnabledChange={setAudioEnabled}
        />

        {/* ── Share FAB ────────────────────────── */}
        {intelligence && moonData && (
          <SessionCardGenerator
            intelligence={intelligence}
            moonData={moonData}
          />
        )}
      </main>
    </>
  );
}
