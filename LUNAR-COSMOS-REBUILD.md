# Lunar Practitioner — Unified Cosmos Rebuild

## ⚠️ CRITICAL RULES — READ BEFORE TOUCHING ANY CODE
1. **Push command**: `git push origin master:main` — EVERY TIME. Vercel deploys from `main`.
2. **NO framer-motion** in page.tsx, cards, or scroll logic. It caused invisible rendering bugs.
3. **Test after EACH step**. Do NOT batch multiple steps into one commit.
4. **Do NOT delete or rename existing component files** that aren't listed here.
5. **Do NOT refactor hooks, types, data, or calculation logic** — only touch visual/rendering code.
6. **If something breaks, revert immediately** with `git checkout -- <file>` before trying again.

---

## The Problem

The app currently has the starfield trapped inside a rectangular moon container. Below it, cards sit on flat black. It looks like two separate apps stitched together. The moon section has visible boundaries.

## The Solution: Unified Cosmos

One cosmic starfield canvas covers the ENTIRE viewport (`position: fixed`). All content (header, moon, cards, calendar) scrolls OVER it. Cards use `backdrop-filter: blur()` glass morphism so the stars show through. No more separate containers.

## Reference

Open `lunar-demo.jsx` in the project root — this is a working React prototype of the target design. Match its visual output.

---

## Step 1: Create CosmicBackground component

**Create file**: `src/components/CosmicBackground/CosmicBackground.tsx`

This is a full-viewport fixed canvas that renders stars and nebula. It runs permanently behind all content.

```tsx
'use client';

import { useRef, useEffect } from 'react';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Star {
  x: number; y: number; size: number;
  b: number; to: number; ts: number;
}

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const spritesRef = useRef<HTMLCanvasElement[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const prevSizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pre-render soft star sprites (4 sizes)
    if (spritesRef.current.length === 0) {
      spritesRef.current = [3, 5, 8, 14].map((d) => {
        const c = document.createElement('canvas');
        c.width = c.height = d * 2;
        const ctx = c.getContext('2d')!;
        const grad = ctx.createRadialGradient(d, d, 0, d, d, d * 0.85);
        grad.addColorStop(0, 'rgba(240,238,248,1)');
        grad.addColorStop(0.12, 'rgba(240,238,248,0.7)');
        grad.addColorStop(0.35, 'rgba(230,228,244,0.2)');
        grad.addColorStop(0.7, 'rgba(220,218,240,0.04)');
        grad.addColorStop(1, 'rgba(220,218,240,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, d * 2, d * 2);
        return c;
      });
    }

    const generateStars = (w: number, h: number): Star[] => {
      const rng = seededRandom(7777);
      const stars: Star[] = [];
      for (let i = 0; i < 900; i++) stars.push({ x: rng() * w, y: rng() * h, size: 0, b: 0.12 + rng() * 0.2, to: rng() * 6.28, ts: 0.001 + rng() * 0.001 });
      for (let i = 0; i < 250; i++) stars.push({ x: rng() * w, y: rng() * h, size: 1, b: 0.2 + rng() * 0.3, to: rng() * 6.28, ts: 0.0015 + rng() * 0.001 });
      for (let i = 0; i < 50; i++) stars.push({ x: rng() * w, y: rng() * h, size: 2, b: 0.35 + rng() * 0.35, to: rng() * 6.28, ts: 0.002 + rng() * 0.001 });
      for (let i = 0; i < 10; i++) stars.push({ x: rng() * w, y: rng() * h, size: 3, b: 0.5 + rng() * 0.5, to: rng() * 6.28, ts: 0.003 + rng() * 0.001 });
      return stars;
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (Math.abs(w - prevSizeRef.current.w) < 3 && Math.abs(h - prevSizeRef.current.h) < 3) return;
      prevSizeRef.current = { w, h };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);
      sizeRef.current = { w, h };
      starsRef.current = generateStars(w, h);
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { w, h } = sizeRef.current;
      if (!w) { rafRef.current = requestAnimationFrame(draw); return; }
      const f = frameRef.current++;
      const sprites = spritesRef.current;

      // Deep void base
      ctx.fillStyle = '#06061A';
      ctx.fillRect(0, 0, w, h);

      // Nebula depth zones
      const n1 = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, w * 0.5);
      n1.addColorStop(0, 'rgba(25,18,55,0.4)');
      n1.addColorStop(0.4, 'rgba(18,14,45,0.2)');
      n1.addColorStop(1, 'transparent');
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, w, h);

      const n2 = ctx.createRadialGradient(w * 0.75, h * 0.6, 0, w * 0.75, h * 0.6, w * 0.4);
      n2.addColorStop(0, 'rgba(15,20,50,0.3)');
      n2.addColorStop(0.5, 'rgba(12,15,40,0.15)');
      n2.addColorStop(1, 'transparent');
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, w, h);

      const n3 = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.3);
      n3.addColorStop(0, 'rgba(20,15,50,0.2)');
      n3.addColorStop(1, 'transparent');
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const s of starsRef.current) {
        const tw = Math.sin(f * s.ts + s.to);
        const a = s.b * (0.5 + 0.5 * tw);
        if (a < 0.01) continue;
        const sp = sprites[s.size];
        if (!sp) continue;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.drawImage(sp, s.x - sp.width / 2, s.y - sp.width / 2);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
```

**Create file**: `src/components/CosmicBackground/index.ts`
```ts
export { default as CosmicBackground } from './CosmicBackground';
```

**After creating**: Commit and push.
```bash
git add -A && git commit -m "Add CosmicBackground fixed canvas" && git push origin master:main
```

**Verify**: The app should still look the same (the component isn't used yet).

---

## Step 2: Add CosmicBackground to layout and remove moon starfield

**Edit file**: `src/app/page.tsx`

At the top, add import:
```tsx
import { CosmicBackground } from '@/components/CosmicBackground';
```

Inside the component return, BEFORE the `<main>` tag, add:
```tsx
<CosmicBackground />
```

Change the `<main>` tag to have transparent background and sit above the canvas:
```tsx
<main className="relative z-[1] min-h-screen text-selenite-white font-body">
```

Remove any `bg-void-black` or `cosmic-atmosphere` class from `<main>` — the background is now the canvas.

**Edit file**: `src/components/MoonCanvas/MoonCanvas.tsx`

The MoonCanvas should now ONLY render the moon orb, glow, phase arc, and orbital info. It should NOT render stars, nebula, or a background fill. The cosmic background behind it is handled by CosmicBackground.

In the `draw()` function:
- REMOVE `ctx.fillStyle = '#05050F'; ctx.fillRect(...)` — no background fill
- REMOVE all star drawing code
- REMOVE nebula/space gradient code
- REMOVE the bottom/top/side fade overlay divs
- Change to `ctx.clearRect(0, 0, w, h)` at the start of each frame
- KEEP only: atmospheric glow, moon texture, terminator, earthshine, phase arc

The container div should be:
```tsx
<div className="relative w-full h-full">
  <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
</div>
```

No `overflow: hidden`. No background colour. Transparent.

**Edit**: The moon section in page.tsx — remove hard height constraint:
```tsx
<section className="relative w-full" style={{ height: '80vh', minHeight: 450 }}>
```

Make it taller (80vh) so the moon has room to breathe with orbital data around it.

**After editing**: Commit and push.
```bash
git add -A && git commit -m "Unified cosmos: CosmicBackground behind all content" && git push origin master:main
```

**Verify**: You should now see stars behind EVERYTHING — behind the header, behind the moon, behind the cards. The moon floats in the starfield without a box.

---

## Step 3: Add orbital information around the moon

**Create file**: `src/components/MoonCanvas/OrbitalInfo.tsx`

This overlays data labels and a phase arc ring around the moon using SVG + positioned divs.

```tsx
'use client';

import type { MoonData, ZodiacPosition } from '@/types/lunar';
import { ZODIAC_CONFIGS } from '@/data/zodiac';
import { getLunarDistance, getPhaseDirection } from '@/lib/moon-calculations';

interface OrbitalInfoProps {
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
}

export default function OrbitalInfo({ moonData, zodiacPosition }: OrbitalInfoProps) {
  if (!moonData) return null;

  const phase = moonData.phase;
  const illum = moonData.illumination;
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
              stroke="rgba(200,196,220,0.1)" strokeWidth="1"
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
          style={{ filter: 'drop-shadow(0 0 3px rgba(200,196,220,0.12))' }}
        />
        {/* Endpoint dot */}
        <circle
          cx={200 + 170 * Math.cos(-Math.PI / 2 + phase * Math.PI * 2)}
          cy={200 + 170 * Math.sin(-Math.PI / 2 + phase * Math.PI * 2)}
          r="3" fill="#E8C97A"
          style={{ filter: 'drop-shadow(0 0 4px rgba(232,201,122,0.5))' }}
        >
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Top label */}
      <div className="absolute top-[6%] left-1/2 -translate-x-1/2 text-center">
        <span className="font-mono text-[9px] tracking-[0.2em] text-moonsilver/30 uppercase">
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
```

**Edit file**: `src/app/page.tsx`

Replace the moon section with a wrapper that includes OrbitalInfo:

```tsx
import OrbitalInfo from '@/components/MoonCanvas/OrbitalInfo';
```

```tsx
{/* ── Moon Hero Section ── */}
<section className="relative w-full flex items-center justify-center" style={{ height: '80vh', minHeight: 450 }}>
  <div className="relative" style={{ width: 'min(85vw, 420px)', height: 'min(85vw, 420px)' }}>
    {/* Moon orb canvas */}
    <div className="absolute inset-0 flex items-center justify-center">
      <MoonCanvas moonData={moonData} zodiacPosition={zodiacPosition} />
    </div>
    {/* Orbital data overlay */}
    <OrbitalInfo moonData={moonData} zodiacPosition={zodiacPosition} />
  </div>
</section>
```

NOTE: You may need to adjust MoonCanvas to accept a size prop or render the canvas at a smaller size than its container, leaving space for the orbital ring and labels around it. The moon orb should be about 60% of the container width, with the orbital ring at ~85%.

**After editing**: Commit and push.
```bash
git add -A && git commit -m "Add orbital info around moon" && git push origin master:main
```

---

## Step 4: Glass card treatment

**Edit file**: `src/app/globals.css`

Add these styles:

```css
/* Glass card — used for all content cards */
.glass-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(240, 238, 248, 0.03) 0%,
    rgba(200, 196, 220, 0.06) 50%,
    rgba(240, 238, 248, 0.02) 100%
  );
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(200, 196, 220, 0.08);
  box-shadow:
    0 0 0 1px rgba(200, 196, 220, 0.04) inset,
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Top edge light catch */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(240, 238, 248, 0.12), transparent);
  pointer-events: none;
  z-index: 2;
}

/* Glass modal overlay */
.glass-modal {
  background: linear-gradient(
    135deg,
    rgba(240, 238, 248, 0.04) 0%,
    rgba(200, 196, 220, 0.07) 50%,
    rgba(240, 238, 248, 0.03) 100%
  );
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  border: 1px solid rgba(200, 196, 220, 0.1);
  box-shadow:
    0 0 0 1px rgba(200, 196, 220, 0.05) inset,
    0 24px 80px rgba(0, 0, 0, 0.6),
    0 8px 32px rgba(0, 0, 0, 0.4);
}

.glass-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(240, 238, 248, 0.2), transparent);
  pointer-events: none;
}
```

Now apply `glass-card` class to ALL card containers in SessionPanel and Calendar components. Apply `glass-modal` to the Settings modal panel.

Search the codebase for card wrapper divs in:
- `src/components/SessionPanel/` — each card (Phase Energy, Frequencies, Zodiac, Session Mood)
- `src/components/Calendar/` — the calendar container
- `src/components/Settings/SettingsModal.tsx` — the modal panel

Add `className="glass-card"` to each. Remove any existing background/border/shadow styles that conflict.

For the Settings modal backdrop:
```tsx
<div className="fixed inset-0 z-[100] bg-[rgba(6,6,26,0.8)] backdrop-blur-sm" onClick={onClose} />
<div className="glass-modal fixed inset-x-4 top-[10vh] bottom-[10vh] z-[101] mx-auto max-w-lg overflow-y-auto rounded-2xl p-6">
  {/* settings content */}
</div>
```

**After editing**: Commit and push.
```bash
git add -A && git commit -m "Glass morphism cards and settings modal" && git push origin master:main
```

---

## Step 5: Final polish

1. Remove any `bg-void-black` backgrounds on section containers — they should be transparent so the cosmic background shows through.

2. The Phase Identity section (phase name, subtitle, quote) should have NO background — text floats directly over the starfield.

3. Add subtle scroll reveal to cards using IntersectionObserver (NOT framer-motion):

**Create file**: `src/components/ui/ScrollReveal.tsx`
```tsx
'use client';

import { useRef, useEffect, useState } from 'react';

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: '-40px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
```

Wrap each card in SessionPanel with `<ScrollReveal delay={0.1 * index}>`.

**After editing**: Commit and push.
```bash
git add -A && git commit -m "Final polish: transparent sections, scroll reveal" && git push origin master:main
```

---

## Checklist — What the Final Result Must Look Like

- [ ] Stars visible EVERYWHERE — behind header, behind moon, behind cards, behind calendar
- [ ] Moon floats in space with NO box or container edges visible
- [ ] Orbital data (illumination %, zodiac, phase direction) positioned around the moon
- [ ] Phase arc ring encircles the moon with pulsing gold dot
- [ ] Cards are glass: you can faintly see stars through them
- [ ] Settings modal has glass treatment matching cards
- [ ] NO flat black backgrounds anywhere — everything is transparent over the cosmic canvas
- [ ] Stars do NOT jump or scramble on scroll
- [ ] Header has backdrop blur HUD feel
- [ ] All pushes go to `origin master:main`

If ANY checkbox fails, stop and fix before proceeding.
