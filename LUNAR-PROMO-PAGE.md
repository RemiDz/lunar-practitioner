# Lunar Practitioner — Promo Page (/promo)

## ⚠️ ALWAYS: `git push origin master:main`

---

## Overview

Build a route at `/promo` inside the existing Lunar Practitioner app. This page serves TWO purposes:

1. **Top section**: A stunning promotional landing page that sells the app to visitors from social media
2. **Bottom section**: A daily content generator that creates shareable social media cards using live moon data

The page uses the SAME data hooks (`useMoonData`, `useSessionIntelligence`) and calculation libraries already in the codebase. No new APIs needed.

The page should NOT be linked from the main app navigation. It's accessed directly via URL: `lunar-practitioner.vercel.app/promo`

---

## ROUTING

Create a new page at `src/app/promo/page.tsx`.

Next.js App Router handles this automatically — just creating the file at that path creates the route.

---

## DESIGN

This page MUST match the quality bar of the main app:
- Uses the CosmicBackground component (same starfield behind everything)
- Glass morphism cards
- Cormorant Garamond + JetBrains Mono typography
- Selenite & Void colour palette
- No flat backgrounds anywhere

---

## Section 1: Hero Landing (What visitors see first)

This is the SELL. When someone clicks the link from Instagram/TikTok, this is what convinces them to open the main app.

### Layout:

```
[CosmicBackground — full page starfield]

┌─────────────────────────────────────────┐
│                                         │
│          ☽  (animated crescent SVG)     │
│                                         │
│       LUNAR PRACTITIONER                │
│    Moon Intelligence for Sound Healing  │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   Today's Moon:                         │
│   [Phase Name] · [Illumination%]        │
│   [Zodiac Sign] ♈                       │
│                                         │
│   "[Today's session quote from          │
│    the intelligence engine]"            │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   ┌─────────────────────────────┐       │
│   │     ▶  Open Live Dashboard  │       │
│   └─────────────────────────────┘       │
│                                         │
│   Free · No signup · Real-time data     │
│                                         │
└─────────────────────────────────────────┘
```

### Implementation:

```tsx
// Hero section
<section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10">

  {/* Animated crescent — same SVG as splash screen */}
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
    {/* Subtle glow behind crescent */}
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

  {/* Today's live data — glass card */}
  <div className="glass-card px-8 py-8 max-w-sm w-full mb-10">
    <p className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase mb-4">
      Today&apos;s Moon
    </p>

    <h2 className="font-display text-2xl text-selenite-white font-light mb-2">
      {moonData?.phaseDisplayName}
    </h2>

    <div className="flex items-center justify-center gap-4 font-mono text-xs text-moonsilver/50 mb-6">
      <span>{moonData?.illuminationPercent}</span>
      <span className="text-moonsilver/20">·</span>
      {zodiacConfig && (
        <span className="text-lunar-gold">
          {zodiacConfig.symbol} {zodiacConfig.name}
        </span>
      )}
    </div>

    {intelligence?.quote && (
      <blockquote className="font-display text-sm text-moonsilver/60 italic leading-relaxed">
        &ldquo;{intelligence.quote}&rdquo;
      </blockquote>
    )}
  </div>

  {/* CTA Button */}
  <a
    href="/"
    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-mono text-sm tracking-wider uppercase transition-all duration-500"
    style={{
      background: 'linear-gradient(135deg, rgba(232,201,122,0.15) 0%, rgba(232,201,122,0.08) 100%)',
      border: '1px solid rgba(232,201,122,0.25)',
      color: '#E8C97A',
      boxShadow: '0 0 20px rgba(232,201,122,0.08)',
    }}
  >
    <span>▶</span>
    <span>Open Live Dashboard</span>
  </a>

  <p className="mt-5 font-mono text-[10px] text-moonsilver/25 tracking-wider">
    Free · No signup · Real-time data
  </p>
</section>
```

Add CSS keyframes to globals.css if not already there:
```css
@keyframes drawPath {
  to { stroke-dashoffset: 0; }
}
@keyframes fadeIn {
  to { opacity: 1; }
}
```

---

## Section 2: Feature Highlights (scroll down)

Three glass cards showing what the app does. Each card highlights a key feature.

```tsx
<section className="max-w-lg mx-auto px-6 pb-20 relative z-10 space-y-5">

  <h2 className="font-display text-xl text-center text-selenite-white/80 font-light tracking-wide mb-8">
    What It Does
  </h2>

  {/* Feature 1 */}
  <ScrollReveal delay={0}>
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <span className="text-2xl mt-0.5">🌙</span>
        <div>
          <h3 className="font-display text-lg text-selenite-white mb-1">Real-Time Moon Intelligence</h3>
          <p className="text-sm text-moonsilver/50 leading-relaxed">
            Live lunar phase, illumination, zodiac transit, and distance — calculated client-side with zero latency.
          </p>
        </div>
      </div>
    </div>
  </ScrollReveal>

  {/* Feature 2 */}
  <ScrollReveal delay={0.12}>
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <span className="text-2xl mt-0.5">🎵</span>
        <div>
          <h3 className="font-display text-lg text-selenite-white mb-1">Session Guidance for Practitioners</h3>
          <p className="text-sm text-moonsilver/50 leading-relaxed">
            Frequencies, instruments, intentions, and session structure tailored to today&apos;s lunar energy. Know exactly what to play and why.
          </p>
        </div>
      </div>
    </div>
  </ScrollReveal>

  {/* Feature 3 */}
  <ScrollReveal delay={0.24}>
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <span className="text-2xl mt-0.5">📅</span>
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
```

---

## Section 3: Daily Shareable Cards

This is the content generator — creates image cards from today's live moon data that can be long-press saved or downloaded.

**IMPORTANT**: These cards must be rendered to `<canvas>` elements so they can be saved as images (not HTML). Use the same approach as Earth Pulse promo cards.

### Card Types to Generate:

#### Card 1: "Today's Moon" — Instagram Post (1080×1080)

Visual layout on canvas:
```
┌─────────────────────────────┐
│                             │
│    Deep space background    │
│    with subtle stars        │
│                             │
│         ☽ (crescent)        │
│                             │
│     WAXING CRESCENT         │
│     20.4% · ♈ Aries         │
│                             │
│   "A sliver of light        │
│    appears. Let your         │
│    intentions take shape."   │
│                             │
│   ─────────────────────     │
│                             │
│   LUNAR PRACTITIONER        │
│   lunar-practitioner.       │
│   vercel.app                │
│                             │
└─────────────────────────────┘
```

#### Card 2: "Session Guide" — Instagram Story (1080×1920)

```
┌─────────────────────────┐
│                         │
│  TODAY'S LUNAR SESSION  │
│  [date]                 │
│                         │
│  Phase: Waxing Crescent │
│  Energy: Emergence      │
│                         │
│  IDEAL FOR:             │
│  · Setting intentions   │
│  · Gentle activation    │
│  · Breathwork + toning  │
│                         │
│  FREQUENCIES:           │
│  417 Hz · 285 Hz        │
│  210.42 Hz (Moon tone)  │
│                         │
│  AVOID:                 │
│  · Release practices    │
│  · Heavy processing     │
│                         │
│  ─────────────────────  │
│                         │
│  ☽ LUNAR PRACTITIONER   │
│  lunar-practitioner.    │
│  vercel.app             │
│                         │
└─────────────────────────┘
```

#### Card 3: "Zodiac Transit" — Instagram Post (1080×1080)

```
┌─────────────────────────────┐
│                             │
│   MOON IN ♈ ARIES           │
│                             │
│   Initiating, bold,         │
│   fiery, courageous         │
│                             │
│   Element: Fire 🔥          │
│   Quality: Cardinal         │
│                             │
│   Body focus:               │
│   Head · Sinuses · Eyes     │
│                             │
│   Sound focus:              │
│   Sharp attacks,            │
│   rhythmic percussion       │
│                             │
│   ─────────────────────     │
│   ☽ LUNAR PRACTITIONER      │
│   lunar-practitioner.       │
│   vercel.app                │
│                             │
└─────────────────────────────┘
```

### Canvas Rendering Implementation:

Each card should be rendered to an HTML `<canvas>` element. This is critical — HTML divs cannot be long-press saved on mobile.

```tsx
function renderCardToCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
) {
  const dpr = 2; // Always render at 2x for crisp output
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = Math.round(height * (width / width)) + 'px'; // maintain aspect
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  drawFn(ctx, width, height);
}
```

For each card, draw:
1. Background: deep void (#06061A) with radial gradient nebula
2. Scattered subtle stars (use seeded random, ~100 small dots)
3. Text: use `ctx.font = '...'` with the same fonts (load them first)
4. Decorative elements: crescent SVG path drawn with canvas path commands
5. Divider line: gradient from transparent to moonsilver to transparent
6. App branding at bottom

**Font loading for canvas**: Canvas needs fonts loaded before drawing. Add a font check:
```tsx
useEffect(() => {
  // Ensure fonts are loaded before rendering cards
  document.fonts.ready.then(() => {
    renderCards();
  });
}, [moonData, intelligence]);
```

### Card container in the page:

```tsx
<section className="max-w-lg mx-auto px-6 pb-20 relative z-10">
  <h2 className="font-display text-xl text-center text-selenite-white/80 font-light tracking-wide mb-3">
    Share Today&apos;s Moon
  </h2>
  <p className="text-center font-mono text-[10px] text-moonsilver/30 tracking-wider mb-8 uppercase">
    Long press to save · Updated daily with live data
  </p>

  <div className="space-y-6">
    {/* Each card is a canvas element the user can long-press save */}
    <div className="glass-card p-3">
      <canvas
        ref={card1Ref}
        className="w-full rounded-lg"
        style={{ aspectRatio: '1/1' }}
      />
      <p className="text-center font-mono text-[9px] text-moonsilver/25 mt-2">
        Today&apos;s Moon · Instagram Post
      </p>
    </div>

    <div className="glass-card p-3">
      <canvas
        ref={card2Ref}
        className="w-full rounded-lg"
        style={{ aspectRatio: '9/16' }}
      />
      <p className="text-center font-mono text-[9px] text-moonsilver/25 mt-2">
        Session Guide · Instagram Story
      </p>
    </div>

    <div className="glass-card p-3">
      <canvas
        ref={card3Ref}
        className="w-full rounded-lg"
        style={{ aspectRatio: '1/1' }}
      />
      <p className="text-center font-mono text-[9px] text-moonsilver/25 mt-2">
        Zodiac Transit · Instagram Post
      </p>
    </div>
  </div>
</section>
```

---

## Section 4: Copy-Paste Captions

Below the cards, provide ready-to-copy social media captions.

```tsx
<section className="max-w-lg mx-auto px-6 pb-20 relative z-10">
  <h2 className="font-display text-xl text-center text-selenite-white/80 font-light tracking-wide mb-6">
    Captions
  </h2>

  {/* Instagram caption */}
  <div className="glass-card p-5 mb-4">
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-[9px] tracking-[0.15em] text-moonsilver/30 uppercase">
        Instagram
      </span>
      <button
        onClick={() => copyToClipboard(instagramCaption)}
        className="font-mono text-[10px] text-lunar-gold/60 hover:text-lunar-gold transition-colors"
      >
        Copy
      </button>
    </div>
    <p className="text-sm text-moonsilver/50 leading-relaxed whitespace-pre-line">
      {instagramCaption}
    </p>
  </div>

  {/* TikTok caption */}
  <div className="glass-card p-5 mb-4">
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-[9px] tracking-[0.15em] text-moonsilver/30 uppercase">
        TikTok
      </span>
      <button
        onClick={() => copyToClipboard(tiktokCaption)}
        className="font-mono text-[10px] text-lunar-gold/60 hover:text-lunar-gold transition-colors"
      >
        Copy
      </button>
    </div>
    <p className="text-sm text-moonsilver/50 leading-relaxed whitespace-pre-line">
      {tiktokCaption}
    </p>
  </div>
</section>
```

### Caption generation logic:

```tsx
const instagramCaption = moonData && intelligence ? `☽ ${moonData.phaseDisplayName} · ${moonData.illuminationPercent} illumination

${intelligence.subtitle}

"${intelligence.quote}"

Today's lunar energy is ideal for:
${intelligence.practices?.ideal?.map(p => `✦ ${p}`).join('\n') || ''}

${zodiacConfig ? `Moon in ${zodiacConfig.symbol} ${zodiacConfig.name} — ${zodiacConfig.keywords?.join(', ')}` : ''}

🎵 Recommended frequencies: ${intelligence.frequencies?.map(f => f.hz + ' Hz').join(' · ') || '210.42 Hz'}

Track the moon in real-time:
🔗 lunar-practitioner.vercel.app

#soundhealing #moonphase #lunarpractitioner #${moonData.phaseDisplayName.toLowerCase().replace(/\s+/g, '')} #moonin${zodiacConfig?.name.toLowerCase() || 'zodiac'} #soundtherapy #frequencyhealing #moonenergy #lunarwisdom #soundjourney` : '';

const tiktokCaption = moonData && intelligence ? `☽ Today's moon: ${moonData.phaseDisplayName} at ${moonData.illuminationPercent}

${intelligence.subtitle}

Perfect for: ${intelligence.practices?.ideal?.slice(0, 2).join(' & ') || 'setting intentions'}

🔗 lunar-practitioner.vercel.app

#soundhealing #moonphase #${moonData.phaseDisplayName.toLowerCase().replace(/\s+/g, '')} #lunarpractitioner #moonenergy` : '';
```

NOTE: The caption fields reference `intelligence.practices`, `intelligence.frequencies`, etc. Check the actual type definitions in `src/types/lunar.ts` to use the correct field names. The data structure might use different property names.

---

## Footer

At the bottom of the promo page:

```tsx
<footer className="relative z-10 py-12 text-center">
  <div className="flex flex-col items-center gap-3">
    <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,196,220,0.12), transparent)' }} />
    <p className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/20 uppercase">
      A NestorLab App
    </p>
    <p className="font-display text-sm text-moonsilver/35 tracking-wide">
      Crafted by Remigijus Dzingelevičius
    </p>
  </div>
</footer>
```

---

## File Structure

```
src/app/promo/
  page.tsx           ← Main promo page component
```

That's it — one file. Import hooks and components from existing codebase:
- `useSessionIntelligence` for moon data + intelligence
- `CosmicBackground` for starfield
- `ScrollReveal` for card entrance animations
- Types from `@/types/lunar`
- Zodiac configs from `@/data/zodiac`

---

## Implementation Notes

1. The page is a `'use client'` component (needs hooks for live data)
2. Canvas cards render on mount + when data loads (useEffect with dependency on moonData)
3. All data is client-side calculated — no API calls needed
4. The CTA button links to `/` (the main app)
5. The page should work on mobile first — all canvas cards are responsive width
6. DO NOT add this page to any navigation in the main app
7. Push with: `git push origin master:main`
