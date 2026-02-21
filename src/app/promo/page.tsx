'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useSessionIntelligence } from '@/hooks/useSessionIntelligence';
import { ZODIAC_CONFIGS } from '@/data/zodiac';
import { CosmicBackground } from '@/components/CosmicBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

// ── Seeded random for canvas star rendering ──────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Canvas helpers ───────────────────────────────────────

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, count: number, seed: number) {
  const rng = seededRandom(seed);
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 0.3 + rng() * 1.2;
    const a = 0.15 + rng() * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,218,240,${a})`;
    ctx.fill();
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#06061A';
  ctx.fillRect(0, 0, w, h);
  // Nebula glow
  const n = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.6);
  n.addColorStop(0, 'rgba(25,18,55,0.5)');
  n.addColorStop(0.5, 'rgba(15,12,40,0.25)');
  n.addColorStop(1, 'transparent');
  ctx.fillStyle = n;
  ctx.fillRect(0, 0, w, h);
  drawStars(ctx, w, h, 120, 1234);
}

function drawCrescent(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(200,196,220,0.7)';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  // Outer arc
  ctx.arc(cx, cy, size, -Math.PI * 0.4, Math.PI * 0.4, false);
  // Inner arc (cutout)
  const innerR = size * 0.75;
  const innerX = cx + size * 0.35;
  ctx.arc(innerX, cy, innerR, Math.PI * 0.38, -Math.PI * 0.38, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(200,196,220,0.08)';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // Glow
  const g = ctx.createRadialGradient(cx, cy, size * 0.3, cx, cy, size * 1.5);
  g.addColorStop(0, 'rgba(200,196,220,0.08)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, w: number) {
  const g = ctx.createLinearGradient(w * 0.2, y, w * 0.8, y);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.5, 'rgba(200,196,220,0.2)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(w * 0.2, y, w * 0.6, 1);
}

function drawBranding(ctx: CanvasRenderingContext2D, w: number, y: number) {
  ctx.fillStyle = 'rgba(200,196,220,0.35)';
  ctx.font = '600 13px "Cormorant Garamond", serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u263D  LUNAR PRACTITIONER', w / 2, y);
  ctx.fillStyle = 'rgba(200,196,220,0.2)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('lunar-practitioner.vercel.app', w / 2, y + 20);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, maxW: number, lineH: number): number {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (const word of words) {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, 0);
      ctx.translate(0, lineH);
      lines++;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, 0);
    ctx.translate(0, lineH);
    lines++;
  }
  return lines;
}

// ── Promo Page Component ─────────────────────────────────

export default function PromoPage() {
  const { intelligence, moonData, zodiacPosition, isLoading } = useSessionIntelligence();

  const zodiacConfig = zodiacPosition ? ZODIAC_CONFIGS[zodiacPosition.signName] : null;

  const card1Ref = useRef<HTMLCanvasElement>(null);
  const card2Ref = useRef<HTMLCanvasElement>(null);
  const card3Ref = useRef<HTMLCanvasElement>(null);

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  // ── Caption generation ──────────────────────────────
  const instagramCaption = moonData && intelligence
    ? `\u263D ${moonData.phaseDisplayName} \u00B7 ${moonData.illuminationPercent} illumination

${intelligence.subtitle}

\u201C${intelligence.quote}\u201D

Today\u2019s lunar energy is ideal for:
${intelligence.phase.idealFor.map(p => `\u2726 ${p}`).join('\n')}

${zodiacConfig ? `Moon in ${zodiacConfig.symbol} ${zodiacConfig.name} \u2014 ${zodiacConfig.energy}` : ''}

\uD83C\uDFB5 Recommended frequencies: ${intelligence.frequencies.map(f => f.hz + ' Hz').join(' \u00B7 ')}

Track the moon in real-time:
\uD83D\uDD17 lunar-practitioner.vercel.app

#soundhealing #moonphase #lunarpractitioner #${moonData.phaseDisplayName.toLowerCase().replace(/\s+/g, '')} #moonin${zodiacConfig?.name.toLowerCase() || 'zodiac'} #soundtherapy #frequencyhealing #moonenergy #lunarwisdom #soundjourney`
    : '';

  const tiktokCaption = moonData && intelligence
    ? `\u263D Today\u2019s moon: ${moonData.phaseDisplayName} at ${moonData.illuminationPercent}

${intelligence.subtitle}

Perfect for: ${intelligence.phase.idealFor.slice(0, 2).join(' & ')}

\uD83D\uDD17 lunar-practitioner.vercel.app

#soundhealing #moonphase #${moonData.phaseDisplayName.toLowerCase().replace(/\s+/g, '')} #lunarpractitioner #moonenergy`
    : '';

  // ── Card rendering ──────────────────────────────────
  const renderCards = useCallback(() => {
    if (!moonData || !intelligence) return;

    const dpr = 2;
    const phaseDisplay = moonData.phaseDisplayName;
    const illumPct = moonData.illuminationPercent;
    const quote = intelligence.quote;
    const zConfig = zodiacConfig;

    // ── Card 1: Today's Moon (1080×1080) ──────────────
    const c1 = card1Ref.current;
    if (c1) {
      const w = 1080, h = 1080;
      c1.width = w * dpr;
      c1.height = h * dpr;
      c1.style.width = '100%';
      const ctx = c1.getContext('2d')!;
      ctx.scale(dpr, dpr);

      drawBackground(ctx, w, h);
      drawCrescent(ctx, w / 2, h * 0.28, 80);

      // Phase name
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F0EEF8';
      ctx.font = '300 52px "Cormorant Garamond", serif';
      ctx.fillText(phaseDisplay, w / 2, h * 0.48);

      // Illumination + zodiac
      ctx.fillStyle = 'rgba(200,196,220,0.5)';
      ctx.font = '14px "JetBrains Mono", monospace';
      let subline = illumPct;
      if (zConfig) subline += `  \u00B7  ${zConfig.symbol} ${zConfig.name}`;
      ctx.fillText(subline, w / 2, h * 0.53);

      // Quote
      if (quote) {
        ctx.fillStyle = 'rgba(200,196,220,0.45)';
        ctx.font = 'italic 24px "Cormorant Garamond", serif';
        ctx.save();
        ctx.translate(0, h * 0.60);
        wrapText(ctx, `\u201C${quote}\u201D`, w / 2, w * 0.7, 34);
        ctx.restore();
      }

      drawDivider(ctx, h * 0.80, w);
      drawBranding(ctx, w, h * 0.88);
    }

    // ── Card 2: Session Guide (1080×1920) ─────────────
    const c2 = card2Ref.current;
    if (c2) {
      const w = 1080, h = 1920;
      c2.width = w * dpr;
      c2.height = h * dpr;
      c2.style.width = '100%';
      const ctx = c2.getContext('2d')!;
      ctx.scale(dpr, dpr);

      drawBackground(ctx, w, h);
      drawStars(ctx, w, h, 80, 5678);

      let y = 120;

      // Header
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(200,196,220,0.35)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.letterSpacing = '4px';
      ctx.fillText('TODAY\u2019S LUNAR SESSION', w / 2, y);
      y += 30;
      ctx.fillStyle = 'rgba(200,196,220,0.25)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), w / 2, y);
      y += 70;

      // Phase + energy
      ctx.fillStyle = '#F0EEF8';
      ctx.font = '300 44px "Cormorant Garamond", serif';
      ctx.fillText(phaseDisplay, w / 2, y);
      y += 35;
      ctx.fillStyle = 'rgba(232,201,122,0.7)';
      ctx.font = 'italic 22px "Cormorant Garamond", serif';
      ctx.fillText(intelligence.subtitle, w / 2, y);
      y += 80;

      // Ideal for
      ctx.textAlign = 'left';
      const marginL = 140;
      ctx.fillStyle = 'rgba(200,196,220,0.3)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('IDEAL FOR', marginL, y);
      y += 35;
      ctx.fillStyle = 'rgba(240,238,248,0.65)';
      ctx.font = '20px "Cormorant Garamond", serif';
      for (const item of intelligence.phase.idealFor) {
        ctx.fillText(`\u2726  ${item}`, marginL, y);
        y += 36;
      }
      y += 30;

      // Frequencies
      ctx.fillStyle = 'rgba(200,196,220,0.3)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('FREQUENCIES', marginL, y);
      y += 35;
      ctx.fillStyle = 'rgba(240,238,248,0.65)';
      ctx.font = '20px "Cormorant Garamond", serif';
      for (const f of intelligence.frequencies) {
        ctx.fillText(`${f.hz} Hz  \u2014  ${f.label}`, marginL, y);
        y += 36;
      }
      y += 30;

      // Avoid
      if (intelligence.avoid.length > 0) {
        ctx.fillStyle = 'rgba(200,196,220,0.3)';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('AVOID', marginL, y);
        y += 35;
        ctx.fillStyle = 'rgba(240,238,248,0.5)';
        ctx.font = '20px "Cormorant Garamond", serif';
        for (const a of intelligence.avoid) {
          ctx.fillText(`\u2013  ${a}`, marginL, y);
          y += 36;
        }
      }

      drawDivider(ctx, h - 180, w);
      drawBranding(ctx, w, h - 120);
    }

    // ── Card 3: Zodiac Transit (1080×1080) ────────────
    const c3 = card3Ref.current;
    if (c3 && zConfig) {
      const w = 1080, h = 1080;
      c3.width = w * dpr;
      c3.height = h * dpr;
      c3.style.width = '100%';
      const ctx = c3.getContext('2d')!;
      ctx.scale(dpr, dpr);

      drawBackground(ctx, w, h);

      let y = 160;

      // Title
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(232,201,122,0.8)';
      ctx.font = '300 48px "Cormorant Garamond", serif';
      ctx.fillText(`Moon in ${zConfig.symbol} ${zConfig.name}`, w / 2, y);
      y += 55;

      // Energy
      ctx.fillStyle = 'rgba(200,196,220,0.5)';
      ctx.font = 'italic 22px "Cormorant Garamond", serif';
      ctx.fillText(zConfig.energy, w / 2, y);
      y += 70;

      // Element + quality
      ctx.textAlign = 'left';
      const mL = 200;
      ctx.fillStyle = 'rgba(200,196,220,0.3)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('ELEMENT & QUALITY', mL, y);
      y += 35;
      ctx.fillStyle = 'rgba(240,238,248,0.65)';
      ctx.font = '22px "Cormorant Garamond", serif';
      ctx.fillText(`${zConfig.element}  \u00B7  ${zConfig.quality}`, mL, y);
      y += 60;

      // Session mood
      ctx.fillStyle = 'rgba(200,196,220,0.3)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('SESSION MOOD', mL, y);
      y += 35;
      ctx.fillStyle = 'rgba(240,238,248,0.55)';
      ctx.font = 'italic 20px "Cormorant Garamond", serif';
      ctx.save();
      ctx.translate(0, y);
      wrapText(ctx, zConfig.sessionMood, mL, w - mL * 2 + 100, 30);
      ctx.restore();
      y += 90;

      // Instruments
      ctx.fillStyle = 'rgba(200,196,220,0.3)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('INSTRUMENTS', mL, y);
      y += 35;
      ctx.fillStyle = 'rgba(240,238,248,0.6)';
      ctx.font = '20px "Cormorant Garamond", serif';
      ctx.fillText(zConfig.instruments.join('  \u00B7  '), mL, y);

      drawDivider(ctx, h - 150, w);
      drawBranding(ctx, w, h - 90);
    }
  }, [moonData, intelligence, zodiacConfig]);

  useEffect(() => {
    if (!moonData || !intelligence) return;
    document.fonts.ready.then(() => {
      renderCards();
    });
  }, [moonData, intelligence, renderCards]);

  return (
    <>
      <CosmicBackground />

      <main className="relative z-[1] min-h-screen text-selenite-white font-body">
        {/* ── Hero Section ──────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10">

          {/* Animated crescent */}
          <div className="mb-10 relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
              <path
                d="M58 40c0 15.464-12.536 28-28 28-8.82 0-16.68-4.08-21.81-10.45C12.28 61.19 17.88 63 23.87 63c15.464 0 28-12.536 28-28S39.334 7 23.87 7c-5.99 0-11.59 1.81-15.68 5.45C13.32 6.08 21.18 2 30 2c15.464 0 28 12.536 28 28z"
                stroke="#C8C4DC"
                strokeWidth="1.5"
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: 200,
                  animation: 'drawPath 1.5s 0.3s ease-out forwards',
                }}
              />
            </svg>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(200,196,220,0.2) 0%, transparent 70%)',
                animation: 'fadeIn 1s 1s ease-out forwards',
                opacity: 0,
              }}
            />
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl font-light tracking-[0.08em] text-selenite-white mb-3">
            Lunar Practitioner
          </h1>
          <p className="font-mono text-xs tracking-[0.2em] text-moonsilver/40 uppercase mb-12">
            Moon Intelligence for Sound Healing
          </p>

          {/* Today's live data */}
          {isLoading ? (
            <div className="glass-card px-8 py-8 max-w-sm w-full mb-10 animate-pulse">
              <div className="h-3 w-24 bg-moonsilver/10 rounded mx-auto mb-4" />
              <div className="h-7 w-48 bg-moonsilver/10 rounded mx-auto mb-3" />
              <div className="h-3 w-36 bg-moonsilver/10 rounded mx-auto mb-6" />
              <div className="h-4 w-56 bg-moonsilver/10 rounded mx-auto" />
            </div>
          ) : moonData && intelligence ? (
            <div className="glass-card px-8 py-8 max-w-sm w-full mb-10">
              <p className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase mb-4">
                Today&apos;s Moon
              </p>

              <h2 className="font-display text-2xl text-selenite-white font-light mb-2">
                {moonData.phaseDisplayName}
              </h2>

              <div className="flex items-center justify-center gap-4 font-mono text-xs text-moonsilver/50 mb-6">
                <span>{moonData.illuminationPercent}</span>
                <span className="text-moonsilver/20">&middot;</span>
                {zodiacConfig && (
                  <span className="text-lunar-gold">
                    {zodiacConfig.symbol} {zodiacConfig.name}
                  </span>
                )}
              </div>

              {intelligence.quote && (
                <blockquote className="font-display text-sm text-moonsilver/60 italic leading-relaxed">
                  &ldquo;{intelligence.quote}&rdquo;
                </blockquote>
              )}
            </div>
          ) : null}

          {/* CTA Button */}
          <a
            href="/"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-mono text-sm tracking-wider uppercase transition-all duration-500 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(232,201,122,0.15) 0%, rgba(232,201,122,0.08) 100%)',
              border: '1px solid rgba(232,201,122,0.25)',
              color: '#E8C97A',
              boxShadow: '0 0 20px rgba(232,201,122,0.08)',
            }}
          >
            <span>&#9654;</span>
            <span>Open Live Dashboard</span>
          </a>

          <p className="mt-5 font-mono text-[10px] text-moonsilver/25 tracking-wider">
            Free &middot; No signup &middot; Real-time data
          </p>
        </section>

        {/* ── Feature Highlights ────────────────── */}
        <section className="max-w-lg mx-auto px-6 pb-20 relative z-10 space-y-5">
          <h2 className="font-display text-xl text-center text-selenite-white/80 font-light tracking-wide mb-8">
            What It Does
          </h2>

          <ScrollReveal delay={0}>
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">&#127769;</span>
                <div>
                  <h3 className="font-display text-lg text-selenite-white mb-1">Real-Time Moon Intelligence</h3>
                  <p className="text-sm text-moonsilver/50 leading-relaxed">
                    Live lunar phase, illumination, zodiac transit, and distance &mdash; calculated client-side with zero latency.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">&#127925;</span>
                <div>
                  <h3 className="font-display text-lg text-selenite-white mb-1">Session Guidance for Practitioners</h3>
                  <p className="text-sm text-moonsilver/50 leading-relaxed">
                    Frequencies, instruments, intentions, and session structure tailored to today&apos;s lunar energy. Know exactly what to play and why.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.24}>
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">&#128197;</span>
                <div>
                  <h3 className="font-display text-lg text-selenite-white mb-1">Lunar Calendar with Zodiac</h3>
                  <p className="text-sm text-moonsilver/50 leading-relaxed">
                    Plan your sessions weeks ahead. See every phase, illumination percentage, and zodiac transit at a glance.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ── Shareable Cards ──────────────────── */}
        <section className="max-w-lg mx-auto px-6 pb-20 relative z-10">
          <ScrollReveal>
            <h2 className="font-display text-xl text-center text-selenite-white/80 font-light tracking-wide mb-3">
              Share Today&apos;s Moon
            </h2>
            <p className="text-center font-mono text-[10px] text-moonsilver/30 tracking-wider mb-8 uppercase">
              Long press to save &middot; Updated daily with live data
            </p>
          </ScrollReveal>

          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <div className="glass-card p-3">
                <canvas
                  ref={card1Ref}
                  className="w-full rounded-lg"
                  style={{ aspectRatio: '1/1' }}
                />
                <p className="text-center font-mono text-[9px] text-moonsilver/25 mt-2">
                  Today&apos;s Moon &middot; Instagram Post
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass-card p-3">
                <canvas
                  ref={card2Ref}
                  className="w-full rounded-lg"
                  style={{ aspectRatio: '9/16' }}
                />
                <p className="text-center font-mono text-[9px] text-moonsilver/25 mt-2">
                  Session Guide &middot; Instagram Story
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="glass-card p-3">
                <canvas
                  ref={card3Ref}
                  className="w-full rounded-lg"
                  style={{ aspectRatio: '1/1' }}
                />
                <p className="text-center font-mono text-[9px] text-moonsilver/25 mt-2">
                  Zodiac Transit &middot; Instagram Post
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Captions ─────────────────────────── */}
        {instagramCaption && (
          <section className="max-w-lg mx-auto px-6 pb-20 relative z-10">
            <ScrollReveal>
              <h2 className="font-display text-xl text-center text-selenite-white/80 font-light tracking-wide mb-6">
                Captions
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="glass-card p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] tracking-[0.15em] text-moonsilver/30 uppercase">
                    Instagram
                  </span>
                  <button
                    onClick={() => copyToClipboard(instagramCaption, 'instagram')}
                    className="font-mono text-[10px] text-lunar-gold/60 hover:text-lunar-gold transition-colors"
                  >
                    {copied === 'instagram' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-moonsilver/50 leading-relaxed whitespace-pre-line">
                  {instagramCaption}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] tracking-[0.15em] text-moonsilver/30 uppercase">
                    TikTok
                  </span>
                  <button
                    onClick={() => copyToClipboard(tiktokCaption, 'tiktok')}
                    className="font-mono text-[10px] text-lunar-gold/60 hover:text-lunar-gold transition-colors"
                  >
                    {copied === 'tiktok' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-moonsilver/50 leading-relaxed whitespace-pre-line">
                  {tiktokCaption}
                </p>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* ── Footer ───────────────────────────── */}
        <footer className="relative z-10 py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,196,220,0.12), transparent)' }} />
            <p className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/20 uppercase">
              A NestorLab App
            </p>
            <p className="font-display text-sm text-moonsilver/35 tracking-wide">
              Crafted by Remigijus Dzingelevi&#269;ius
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
