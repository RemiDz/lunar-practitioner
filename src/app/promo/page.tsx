'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useSessionIntelligence } from '@/hooks/useSessionIntelligence';
import { ZODIAC_CONFIGS } from '@/data/zodiac';
import { CosmicBackground } from '@/components/CosmicBackground';

// ── Seeded random ────────────────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Phase category from 0–1 phase value ──────────────────
function getPhaseCategory(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'new';
  if (phase < 0.22) return 'crescent';
  if (phase < 0.28) return 'quarter';
  if (phase < 0.47) return 'gibbous';
  if (phase < 0.53) return 'full';
  if (phase < 0.72) return 'gibbous';
  if (phase < 0.78) return 'quarter';
  if (phase < 0.97) return 'crescent';
  return 'new';
}

// ── Opening hooks by phase category ──────────────────────
const HOOKS: Record<string, string[]> = {
  new: [
    "The sky is dark tonight \u2014 and that\u2019s exactly when the magic begins \uD83C\uDF11",
    "New Moon energy is reset energy. Here\u2019s what to release today...",
    "Sound healers: this is your most powerful session night of the month",
    "Everything starts in darkness. Tonight\u2019s new moon is proof of that \u2728",
    "The moon has gone quiet. Have you?",
  ],
  crescent: [
    "A sliver of light just appeared \u2014 can you feel the shift? \u263D",
    "The waxing crescent is whispering: set your intentions NOW",
    "This thin crescent holds more power than you think...",
    "Sound healers \u2014 tonight\u2019s crescent energy is perfect for gentle activation \uD83C\uDFB5",
    "The moon is barely visible but the energy is building fast",
  ],
  quarter: [
    "Half light, half shadow \u2014 today\u2019s moon mirrors your inner balance \u25D0",
    "First quarter energy means it\u2019s time to take action on those intentions",
    "The moon is at a crossroads tonight. So are you.",
    "Quarter moon sessions hit different \u2014 here\u2019s why sound healers love this phase",
    "Halfway to full. The momentum is real.",
  ],
  gibbous: [
    "The moon is almost full and the energy is INTENSE right now \uD83C\uDF14",
    "Gibbous moon = refinement energy. Perfect night to fine-tune your practice",
    "Can\u2019t sleep? The gibbous moon might be why...",
    "Sound healers: tonight calls for deep, resonant frequencies",
    "The light is building. Trust the process.",
  ],
  full: [
    "FULL MOON TONIGHT \uD83C\uDF15 Here\u2019s what every sound healer needs to know",
    "The moon is at 100%. Your energy probably is too.",
    "Full moon sessions are the most powerful of the month \u2014 here\u2019s how to use it",
    "If you\u2019re feeling everything tonight, blame the full moon (seriously)",
    "Peak illumination. Peak energy. Peak healing potential.",
  ],
};

// ── Canvas helpers ───────────────────────────────────────

function wrapTextCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

// ── Main Component ───────────────────────────────────────

export default function ContentStudio() {
  const { intelligence, moonData, zodiacPosition, isLoading } = useSessionIntelligence();
  const zodiacConfig = zodiacPosition ? ZODIAC_CONFIGS[zodiacPosition.signName] : null;

  const cardCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cardFormat, setCardFormat] = useState<'post' | 'story'>('post');
  const [selectedHook, setSelectedHook] = useState(0);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Current phase category + hooks
  const phaseCategory = moonData ? getPhaseCategory(moonData.phase) : 'new';
  const currentHooks = HOOKS[phaseCategory] || HOOKS.new;

  // ── Shuffle hooks ──────────────────────────────────
  const shuffleHooks = useCallback(() => {
    setSelectedHook(Math.floor(Math.random() * currentHooks.length));
  }, [currentHooks.length]);

  // ── Copy to clipboard ──────────────────────────────
  const copyCaption = useCallback((platform: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    });
  }, []);

  // ── Download card ──────────────────────────────────
  const downloadCard = useCallback(() => {
    const canvas = cardCanvasRef.current;
    if (!canvas || !moonData) return;
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `lunar-${moonData.phaseDisplayName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}-${cardFormat}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [moonData, cardFormat]);

  // ── Render canvas card ─────────────────────────────
  const renderCard = useCallback(() => {
    const canvas = cardCanvasRef.current;
    if (!canvas || !moonData || !intelligence) return;

    const w = 1080;
    const h = cardFormat === 'post' ? 1080 : 1920;
    const dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const phase = moonData.phase;
    const illumination = moonData.illumination;
    const phaseName = moonData.phaseDisplayName;
    const illumPct = moonData.illuminationPercent;
    const quote = intelligence.quote;
    const zConfig = zodiacConfig;

    // 1. Background
    ctx.fillStyle = '#06061A';
    ctx.fillRect(0, 0, w, h);

    const nebula = ctx.createRadialGradient(w * 0.4, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.6);
    nebula.addColorStop(0, 'rgba(25,18,55,0.35)');
    nebula.addColorStop(0.5, 'rgba(15,12,40,0.15)');
    nebula.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, w, h);

    // 2. Stars (daily seed)
    const rng = seededRandom((Date.now() / 86400000) | 0);
    for (let i = 0; i < 80; i++) {
      const sx = rng() * w, sy = rng() * h;
      const sr = 0.5 + rng() * 1.5;
      const sa = 0.1 + rng() * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,196,220,${sa})`;
      ctx.fill();
    }

    // 3. Moon orb
    const moonCx = w / 2;
    const moonCy = h * (h > w ? 0.22 : 0.3);
    const moonR = w * 0.15;

    ctx.beginPath();
    ctx.arc(moonCx, moonCy, moonR, 0, Math.PI * 2);
    const moonGrad = ctx.createRadialGradient(
      moonCx - moonR * 0.2, moonCy - moonR * 0.1, moonR * 0.05,
      moonCx, moonCy, moonR,
    );
    moonGrad.addColorStop(0, '#c8c4d8');
    moonGrad.addColorStop(0.5, '#908c9c');
    moonGrad.addColorStop(1, '#504c5c');
    ctx.fillStyle = moonGrad;
    ctx.fill();

    // Terminator
    const phaseAngle = phase * Math.PI * 2;
    const k = Math.cos(phaseAngle);
    const isWax = Math.sin(phaseAngle) >= 0;
    ctx.save();
    ctx.beginPath();
    ctx.arc(moonCx, moonCy, moonR, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(moonCx, moonCy - moonR);
    ctx.arc(moonCx, moonCy, moonR, -Math.PI / 2, Math.PI / 2, isWax);
    for (let i = 0; i <= 60; i++) {
      const a = Math.PI / 2 - (i / 60) * Math.PI;
      ctx.lineTo(moonCx + k * moonR * Math.cos(a), moonCy + moonR * Math.sin(a));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,6,26,0.95)';
    ctx.fill();
    ctx.restore();

    // Glow
    const glow = ctx.createRadialGradient(moonCx, moonCy, moonR, moonCx, moonCy, moonR * 1.6);
    glow.addColorStop(0, `rgba(200,196,220,${0.04 * illumination})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonCx, moonCy, moonR * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // 4. Text content
    ctx.textAlign = 'center';
    const textY = moonCy + moonR + w * 0.08;

    // Phase name
    ctx.font = `300 ${w * 0.065}px "Cormorant Garamond", serif`;
    ctx.fillStyle = '#F0EEF8';
    ctx.fillText(phaseName, w / 2, textY);

    // Illumination + zodiac
    ctx.font = `${w * 0.025}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(200,196,220,0.5)';
    let subline = illumPct;
    if (zConfig) subline += `  \u00B7  ${zConfig.symbol} ${zConfig.name}`;
    ctx.fillText(subline, w / 2, textY + w * 0.05);

    // Divider
    const divY = textY + w * 0.09;
    const divGrad = ctx.createLinearGradient(w * 0.3, divY, w * 0.7, divY);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.5, 'rgba(200,196,220,0.15)');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, divY);
    ctx.lineTo(w * 0.7, divY);
    ctx.stroke();

    // Quote
    const quoteY = divY + w * 0.06;
    ctx.font = `italic 300 ${w * 0.032}px "Cormorant Garamond", serif`;
    ctx.fillStyle = 'rgba(200,196,220,0.6)';
    const afterQuoteY = wrapTextCanvas(ctx, `\u201C${quote}\u201D`, w / 2, quoteY, w * 0.7, w * 0.045);

    // Story-format extras
    if (h > w) {
      const sessionY = Math.max(afterQuoteY + w * 0.06, h * 0.52);

      // "Today's Session" heading
      ctx.font = `${w * 0.022}px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(200,196,220,0.3)';
      ctx.fillText("TODAY\u2019S SESSION", w / 2, sessionY);

      // Ideal for
      const idealY = sessionY + w * 0.06;
      ctx.font = `${w * 0.02}px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(200,196,220,0.35)';
      ctx.fillText('IDEAL FOR', w / 2, idealY);

      ctx.font = `300 ${w * 0.028}px "Cormorant Garamond", serif`;
      ctx.fillStyle = 'rgba(240,238,248,0.65)';
      const practices = intelligence.phase.idealFor.slice(0, 4);
      practices.forEach((p, i) => {
        ctx.fillText(`\u2726 ${p}`, w / 2, idealY + w * 0.05 + i * w * 0.04);
      });

      // Frequencies
      const freqY = idealY + w * 0.05 + practices.length * w * 0.04 + w * 0.06;
      ctx.font = `${w * 0.02}px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(200,196,220,0.35)';
      ctx.fillText('FREQUENCIES', w / 2, freqY);

      ctx.font = `${w * 0.03}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#E8C97A';
      const freqStr = intelligence.frequencies.map(f => `${f.hz} Hz`).join(' \u00B7 ');
      ctx.fillText(freqStr, w / 2, freqY + w * 0.05);
    }

    // 5. Bottom branding
    const brandY = h - w * 0.08;

    const bDivGrad = ctx.createLinearGradient(w * 0.35, brandY - w * 0.03, w * 0.65, brandY - w * 0.03);
    bDivGrad.addColorStop(0, 'transparent');
    bDivGrad.addColorStop(0.5, 'rgba(200,196,220,0.1)');
    bDivGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = bDivGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, brandY - w * 0.03);
    ctx.lineTo(w * 0.65, brandY - w * 0.03);
    ctx.stroke();

    ctx.font = `${w * 0.02}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(200,196,220,0.3)';
    ctx.fillText('\u263D LUNAR PRACTITIONER', w / 2, brandY);

    ctx.font = `${w * 0.018}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(200,196,220,0.2)';
    ctx.fillText('lunar-practitioner.vercel.app', w / 2, brandY + w * 0.03);
  }, [moonData, intelligence, zodiacConfig, cardFormat]);

  // Re-render when data or format changes
  useEffect(() => {
    if (!moonData || !intelligence) return;
    document.fonts.ready.then(() => {
      renderCard();
    });
  }, [moonData, intelligence, cardFormat, renderCard]);

  // ── Caption templates ──────────────────────────────
  const currentHookText = currentHooks[selectedHook] || '';
  const appUrl = 'lunar-practitioner.vercel.app';
  const phaseName = moonData?.phaseDisplayName || '';
  const illumPct = moonData?.illuminationPercent || '';
  const quote = intelligence?.quote || '';

  const captions: Record<string, string> = moonData && intelligence ? {
    instagram: `${currentHookText}

\u263D ${phaseName} \u00B7 ${illumPct} illumination
${zodiacConfig ? `Moon in ${zodiacConfig.symbol} ${zodiacConfig.name}` : ''}

\u201C${quote}\u201D

${intelligence.subtitle}

${intelligence.phase.idealFor.map(p => `\u2726 ${p}`).join('\n')}

\uD83C\uDFB5 Frequencies: ${intelligence.frequencies.map(f => f.hz + ' Hz').join(' \u00B7 ')}

Track the moon in real-time \u2014 link in bio \u263D
${appUrl}

#soundhealing #moonphase #lunarpractitioner #${phaseName.toLowerCase().replace(/\s+/g, '')} #moonin${zodiacConfig?.name.toLowerCase() || 'zodiac'} #soundtherapy #frequencyhealing #moonenergy #lunarwisdom #soundjourney #fullmoon #newmoon #soundbath`,

    tiktok: `${currentHookText}

\u263D ${phaseName} at ${illumPct}
${zodiacConfig ? `Moon in ${zodiacConfig.name}` : ''}

${intelligence.subtitle}

\uD83D\uDD17 ${appUrl}

#soundhealing #moonphase #lunarpractitioner #moonenergy #soundtherapy #fyp #spiritualtiktok #frequencyhealing`,

    twitter: `${currentHookText}

\u263D ${phaseName} \u00B7 ${illumPct} \u00B7 ${zodiacConfig?.symbol || ''} ${zodiacConfig?.name || ''}

${appUrl}`,

    whatsapp: `Hey! Check what the moon is doing tonight:

\u263D ${phaseName} \u2014 ${illumPct} illumination
${zodiacConfig ? `Moon in ${zodiacConfig.symbol} ${zodiacConfig.name}` : ''}

\u201C${quote}\u201D

I\u2019ve been using this free moon tracker for my sound healing sessions \u2014 it shows you the best frequencies and practices for each phase. Have a look: https://${appUrl}`,
  } : {};

  // ── Render ─────────────────────────────────────────

  return (
    <>
      <CosmicBackground />

      <main className="relative z-[1] min-h-screen text-selenite-white font-body">
        {/* ── Header ─────────────────────────── */}
        <header className="text-center pt-12 pb-6 px-6 relative z-10">
          <h1 className="font-display text-2xl text-selenite-white font-light tracking-wide mb-1">
            &#9789; Lunar Practitioner &mdash; Content Studio
          </h1>
          <p className="font-mono text-xs text-moonsilver/40 mb-3">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {isLoading ? (
            <p className="font-mono text-sm text-moonsilver/30">Loading moon data...</p>
          ) : moonData ? (
            <p className="font-mono text-sm text-moonsilver/60">
              {moonData.phaseDisplayName} &middot; {moonData.illuminationPercent} &middot;{' '}
              {zodiacConfig && (
                <span className="text-lunar-gold">{zodiacConfig.symbol} {zodiacConfig.name}</span>
              )}
            </p>
          ) : null}
        </header>

        {/* ── Quick Stats ────────────────────── */}
        {moonData && (
          <section className="max-w-2xl mx-auto px-4 mb-8 relative z-10">
            <div className="glass-card p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Phase</span>
                  <p className="text-selenite-white mt-1">{moonData.phaseDisplayName}</p>
                </div>
                <div>
                  <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Illumination</span>
                  <p className="text-selenite-white mt-1">{moonData.illuminationPercent}</p>
                </div>
                <div>
                  <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Zodiac</span>
                  <p className="text-lunar-gold mt-1">{zodiacConfig?.symbol} {zodiacConfig?.name}</p>
                </div>
                <div>
                  <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Direction</span>
                  <p className="text-selenite-white mt-1">{moonData.phase < 0.5 ? '\u2191 Waxing' : '\u2193 Waning'}</p>
                </div>
                <div>
                  <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Moon Tone</span>
                  <p className="text-selenite-white mt-1">210.42 Hz (D#/Eb)</p>
                </div>
                <div>
                  <span className="text-moonsilver/30 uppercase tracking-wider text-[9px]">Energy</span>
                  <p className="text-selenite-white mt-1">{intelligence?.subtitle || 'Loading...'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Shareable Card ─────────────────── */}
        <section className="max-w-2xl mx-auto px-4 mb-8 relative z-10">
          <div className="glass-card p-4">
            {/* Format toggle */}
            <div className="flex gap-2 mb-4 justify-center">
              <button
                onClick={() => setCardFormat('post')}
                className={`font-mono text-xs px-4 py-1.5 rounded-full border transition-all ${
                  cardFormat === 'post'
                    ? 'border-lunar-gold/40 text-lunar-gold bg-lunar-gold/10'
                    : 'border-moonsilver/15 text-moonsilver/40 hover:text-moonsilver/60'
                }`}
              >
                Post 1:1
              </button>
              <button
                onClick={() => setCardFormat('story')}
                className={`font-mono text-xs px-4 py-1.5 rounded-full border transition-all ${
                  cardFormat === 'story'
                    ? 'border-lunar-gold/40 text-lunar-gold bg-lunar-gold/10'
                    : 'border-moonsilver/15 text-moonsilver/40 hover:text-moonsilver/60'
                }`}
              >
                Story 9:16
              </button>
            </div>

            {/* Canvas */}
            <canvas
              ref={cardCanvasRef}
              className="w-full rounded-lg"
              style={{ aspectRatio: cardFormat === 'post' ? '1/1' : '9/16' }}
            />

            {/* Download */}
            <button
              onClick={downloadCard}
              className="w-full mt-4 py-3 rounded-xl font-mono text-sm tracking-wider uppercase transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(232,201,122,0.15), rgba(232,201,122,0.08))',
                border: '1px solid rgba(232,201,122,0.25)',
                color: '#E8C97A',
              }}
            >
              &#11015; Download PNG
            </button>
          </div>
        </section>

        {/* ── Opening Hooks ──────────────────── */}
        <section className="max-w-2xl mx-auto px-4 mb-8 relative z-10">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase">
                Opening Hook
              </span>
              <button
                onClick={shuffleHooks}
                className="font-mono text-[10px] text-lunar-gold/50 hover:text-lunar-gold transition-colors"
              >
                &#128256; Shuffle
              </button>
            </div>
            <div className="space-y-2">
              {currentHooks.map((hook, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedHook(i)}
                  className={`w-full text-left p-3 rounded-lg font-display text-sm transition-all ${
                    selectedHook === i
                      ? 'bg-lunar-gold/10 border border-lunar-gold/20 text-selenite-white'
                      : 'border border-transparent text-moonsilver/50 hover:text-moonsilver/70 hover:bg-white/[0.02]'
                  }`}
                >
                  {hook}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ready-to-Copy Captions ─────────── */}
        {Object.keys(captions).length > 0 && (
          <section className="max-w-2xl mx-auto px-4 mb-8 relative z-10 space-y-3">
            <h2 className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase text-center mb-4">
              Ready-to-Copy Captions
            </h2>
            {Object.entries(captions).map(([platform, text]) => (
              <div key={platform} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-moonsilver/35 uppercase">
                    {platform}
                  </span>
                  <button
                    onClick={() => copyCaption(platform, text)}
                    className="font-mono text-[10px] px-3 py-1 rounded-full border border-moonsilver/15 text-moonsilver/40 hover:text-lunar-gold hover:border-lunar-gold/30 transition-all"
                  >
                    {copiedPlatform === platform ? '\u2713 Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-moonsilver/45 leading-relaxed whitespace-pre-line font-mono">
                  {text}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* ── Content Calendar Hints ─────────── */}
        <section className="max-w-2xl mx-auto px-4 pb-20 relative z-10">
          <div className="glass-card p-5">
            <span className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase block mb-4">
              Content Calendar
            </span>

            <div className="mb-5">
              <p className="font-mono text-[10px] text-moonsilver/35 uppercase tracking-wider mb-2">Best times to post</p>
              <div className="space-y-1.5 text-xs text-moonsilver/50">
                <p>Instagram: 9&ndash;11am, 7&ndash;9pm</p>
                <p>TikTok: 7&ndash;9am, 12&ndash;3pm, 7&ndash;11pm</p>
                <p>Twitter/X: 8&ndash;10am, 12&ndash;1pm</p>
              </div>
            </div>

            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,196,220,0.06), transparent)' }} />

            <div className="mt-5">
              <p className="font-mono text-[10px] text-moonsilver/35 uppercase tracking-wider mb-2">Ideas for this week</p>
              <div className="space-y-2 text-xs text-moonsilver/50">
                {moonData && moonData.phase < 0.05 && (
                  <p>&#128161; &ldquo;New moon reset ritual&rdquo; &mdash; share your preparation process</p>
                )}
                {moonData && moonData.phase > 0.45 && moonData.phase < 0.55 && (
                  <p>&#128161; &ldquo;Full moon sound bath&rdquo; &mdash; go live during your session</p>
                )}
                {moonData && moonData.phase >= 0.05 && moonData.phase < 0.45 && (
                  <p>&#128161; &ldquo;Waxing moon intentions&rdquo; &mdash; ask followers what they&apos;re manifesting</p>
                )}
                {moonData && moonData.phase > 0.55 && (
                  <p>&#128161; &ldquo;Waning moon release&rdquo; &mdash; share what you&apos;re letting go of</p>
                )}
                <p>&#128161; Share today&apos;s card with a personal story about how moon energy affected your week</p>
                <p>&#128161; Post a 15-second clip playing the moon tone (210.42 Hz) with the card as background</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────── */}
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
