# Lunar Practitioner — Visual Overhaul Spec v2.0

## ⚠️ CRITICAL: Git Push Configuration
**ALWAYS push to `main`, not `master`. Vercel deploys from `main`.**
```bash
git push origin master:main
```
If you use `git push` or `git push origin master`, changes will NOT deploy. Every single push must target `main`.

---

## Design Philosophy: "Celestial Observatory"

This is NOT another dark-mode app with rounded cards. This is a **sacred instrument** for sound healing practitioners — it should feel like peering through the lens of a celestial observatory, where the boundary between digital and cosmos dissolves.

**Reference aesthetic**: Think the movie Interstellar meets a high-end planetarium app meets sacred geometry. Every pixel should feel intentional, atmospheric, and alive.

**Core palette** (already defined in CSS variables):
- `--void-black: #05050F` — deep space, never pure black
- `--selenite-white: #F0EEF8` — luminous, slightly lavender white
- `--moonsilver: #C8C4DC` — mid-tone, used for secondary text
- `--lunar-gold: #E8C97A` — accent, sacred, warm

**Typography**: Cormorant Garamond (display) + JetBrains Mono (data). These are already loaded — use them consistently.

---

## Phase 1: The Moon — Hero Showstopper

The moon is the FIRST thing users see. It must be breathtaking. Currently it looks like a gradient circle with sparkly glitter around it. We need photorealistic depth.

### 1A: Replace Canvas2D Moon with WebGL (Three.js)

**File**: `src/components/MoonCanvas/MoonCanvas.tsx`

**IMPORTANT**: Three.js MUST be dynamically imported with `ssr: false` in Next.js:
```tsx
import dynamic from 'next/dynamic';
const MoonScene = dynamic(() => import('./MoonScene'), { ssr: false });
```

Create `src/components/MoonCanvas/MoonScene.tsx` with Three.js:

**Moon sphere requirements**:
- Use `THREE.SphereGeometry(1, 128, 128)` — high poly count for smooth edges
- Load NASA lunar texture from `/textures/moon-surface.jpg` (already in public/textures/) using `THREE.TextureLoader`
- Add a normal/bump map for surface depth: `/textures/moon-normal.jpg` — download a free lunar normal map or generate from the surface texture
- Apply `THREE.MeshPhongMaterial` with:
  - `map`: lunar surface texture
  - `bumpMap`: normal map
  - `bumpScale`: 0.04
  - `shininess`: 2 (matte, not glossy)
- If texture fails to load, fall back to a procedural shader (see 1B below)

**Lighting**:
- Single `THREE.DirectionalLight` positioned based on the actual phase angle
  - Phase 0 (new moon): light from behind (no visible light)
  - Phase 0.25 (first quarter): light from the right
  - Phase 0.5 (full moon): light from front
  - Phase 0.75 (last quarter): light from the left
  - Use `const lightAngle = phase * Math.PI * 2;` and position light at `(Math.sin(lightAngle) * 3, 0, Math.cos(lightAngle) * 3)`
- Subtle `THREE.AmbientLight(0x1a1a3e, 0.08)` for earthshine on dark side
- Add a very faint `THREE.PointLight` with warm colour `0xe8c97a` at low intensity near full moon phases

**Animation**:
- Slow **libration** (wobble): `moon.rotation.y = baseRotation + Math.sin(time * 0.0003) * 0.03`
- Moon should NOT spin — it's tidally locked. Just the subtle libration wobble
- Smooth transition when phase data updates

**Camera**:
- `THREE.PerspectiveCamera(45, aspect, 0.1, 100)` positioned at z=2.8
- No orbit controls — fixed view, the moon is the subject

**Atmosphere / Glow**:
- Add a slightly larger transparent sphere (radius 1.04) behind the moon with a custom shader:
  - Fresnel-based rim glow that's brighter on the lit side
  - Colour interpolates between cool silver (#C8C4DC) and warm gold (#E8C97A) based on illumination
  - Opacity pulses slowly: `0.12 + sin(time * 0.002) * 0.03`
- Add a `THREE.Sprite` with a radial gradient texture for the outer atmospheric halo
  - Scale: 3x moon size
  - Opacity based on illumination: `illumination * 0.15`

**Phase arc ring**:
- Use `THREE.RingGeometry` or a custom `THREE.Line` circle around the moon
- Progress fills based on phase (0-1)
- Glowing endpoint dot (gold, pulsing)
- The ring should have a subtle 3D tilt (slight perspective)

### 1B: Procedural Fallback (if texture fails)

If the texture doesn't load (CORS, 404, etc.), use a Canvas2D procedural texture:
- Generate a 1024x512 texture with:
  - Base grey gradient
  - Perlin noise for surface variation
  - Darker elliptical patches for maria
  - Small bright spots for craters
- Apply this as the `map` on the Three.js material

### 1C: Performance

- Use `requestAnimationFrame` with frame limiting (30fps is fine for the moon, saves battery)
- Dispose Three.js resources on unmount
- Use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — cap at 2x for performance
- Canvas should be the full section size (45vh minimum)

---

## Phase 2: Starfield — Deep Space, Not Glitter

The current starfield looks like scattered glitter on black paper. Real night sky has DEPTH — nebula clouds, star clusters, magnitude variation, and atmosphere.

### 2A: Replace Uniform Dots with Layered Depth

**File**: Create new `src/components/MoonCanvas/DeepStarfield.tsx`

This should be a separate canvas BEHIND the Three.js moon (z-index layering), or integrated into the Three.js scene as particle system.

**Option A — Three.js Particles (preferred, integrates with moon scene)**:
- Use `THREE.Points` with `THREE.BufferGeometry`
- 3 depth layers:
  - **Far stars** (2000 points): tiny (size 0.5-1px), dim, slow twinkle, slight blue tint
  - **Mid stars** (500 points): medium (1-2px), moderate brightness, normal twinkle
  - **Near stars** (50 points): larger (2-4px), bright, warm/cool colour variation, visible glow
- Star positions: random in a large sphere around the camera, but biased towards the edges (away from moon centre)
- Use a custom shader material for the points:
  - Soft circular falloff (not hard dots)
  - Per-star brightness variation via attribute
  - Twinkle via time uniform: `brightness * (0.6 + 0.4 * sin(time * speed + offset))`
  - Size attenuation enabled

**Option B — Canvas2D (if Three.js particles are complex)**:
- Separate canvas behind the moon
- Stars should have:
  - Gaussian brightness profile (soft edges, not hard circles)
  - Size varies by magnitude: most are sub-pixel (0.5-0.8px), few are 1-2px, rare bright ones 2-3px
  - Colour: most white/blue-white, some warm orange-white, rare blue
  - Twinkle should be SLOW and SUBTLE — not rapid flickering

### 2B: Nebula Clouds

Add 2-3 very subtle nebula patches to give the sky DEPTH:
- Use large radial gradients or pre-rendered nebula sprites
- Colours: deep indigo (#0A0A2E → #1A1A4E), very subtle purple/blue
- Opacity: 0.02-0.06 MAX — these should be barely perceptible
- Position: offset from centre (don't overlap the moon)
- One diagonal band (Milky Way) — already exists but needs to be more cloud-like, less linear

### 2C: Shooting Stars

Keep the existing shooting star logic but improve:
- Longer, more graceful trails with exponential fade
- Very rare (1 every 15-30 seconds average)
- Slight arc/curve to the path, not perfectly straight
- Brief bright flash at the head
- Leave a faint afterglow trail that fades over 0.5s

---

## Phase 3: Cards — Glass Morphism with Depth

Currently the cards look flat and generic. They need to feel like they're floating in space with real depth.

### 3A: Glass Card Component

**File**: Create `src/components/ui/GlassCard.tsx`

```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'silver' | 'gold' | 'phase'; // glow colour theme
  intensity?: 'subtle' | 'medium' | 'strong';
}
```

**CSS properties for the glass effect**:
```css
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(240, 238, 248, 0.03) 0%,
    rgba(200, 196, 220, 0.06) 50%,
    rgba(240, 238, 248, 0.02) 100%
  );
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(200, 196, 220, 0.08);
  border-radius: 16px;
  box-shadow:
    0 0 0 1px rgba(200, 196, 220, 0.05) inset,
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* Top edge highlight — simulates light catching the glass edge */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(240, 238, 248, 0.15),
    transparent
  );
}

/* Animated gradient border glow on hover */
.glass-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: conic-gradient(
    from var(--border-angle, 0deg),
    transparent 60%,
    rgba(200, 196, 220, 0.1) 80%,
    rgba(232, 201, 122, 0.08) 90%,
    transparent 100%
  );
  z-index: -1;
  animation: borderRotate 8s linear infinite;
}

@keyframes borderRotate {
  to { --border-angle: 360deg; }
}
```

**Note**: `@property --border-angle` needs to be registered for the conic-gradient animation:
```css
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

### 3B: Card Inner Atmosphere

Each card should have a subtle dynamic background that makes it feel alive:

- **Phase Energy card**: Faint radial glow in the top-right corner matching the current phase colour
- **Frequencies card**: Very subtle vertical lines (like sound waves) at 0.02 opacity, slowly drifting
- **Zodiac card**: Faint constellation dots pattern specific to current sign
- **Calendar card**: Already looks good — just apply the glass treatment

Implementation: Add a `<div className="card-atmosphere">` inside each card with absolute positioning, low opacity, and overflow hidden.

### 3C: Card Entrance Animations

Use CSS `@keyframes` (NOT framer-motion — we've removed it to avoid the bugs):

```css
.card-reveal {
  opacity: 0;
  transform: translateY(24px);
  animation: cardReveal 0.8s ease-out forwards;
}

@keyframes cardReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Stagger cards with `animation-delay`: 0s, 0.15s, 0.3s, 0.45s.

Use `IntersectionObserver` to trigger animations on scroll (not framer-motion whileInView).

### 3D: Card Scroll Reveal System

**File**: Create `src/components/ui/ScrollReveal.tsx`

Replace the framer-motion ScrollReveal with a pure CSS + IntersectionObserver version:

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
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: '-40px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
```

---

## Phase 4: Splash Screen

The splash screen should return as a ceremonial entrance. Use the fixed version (pure CSS, no framer-motion) already created.

**File**: `src/components/SplashScreen/SplashScreen.tsx` — already replaced with the working version.

Add to `page.tsx`:
```tsx
import SplashScreen from '@/components/SplashScreen/SplashScreen';

// In the component:
const [splashDismissed, setSplashDismissed] = useState(false);

// In the JSX, BEFORE <main>:
{!splashDismissed && (
  <SplashScreen
    isReady={!isLoading}
    onDismiss={() => setSplashDismissed(true)}
  />
)}
```

---

## Phase 5: Overall App Atmosphere

### 5A: Deep Space Background

The `<main>` element needs atmospheric depth, not flat black:

```css
main {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(15, 12, 40, 0.5) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 70%, rgba(20, 15, 50, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 20% 90%, rgba(10, 15, 40, 0.3) 0%, transparent 50%),
    #05050F;
}
```

This creates subtle nebula-like depth zones behind the content.

### 5B: Header Polish

The sticky header should feel like a HUD overlay:

```css
header {
  background: linear-gradient(
    180deg,
    rgba(5, 5, 15, 0.85) 0%,
    rgba(5, 5, 15, 0.6) 100%
  );
  backdrop-filter: blur(16px) saturate(1.3);
  border-bottom: 1px solid rgba(200, 196, 220, 0.06);
}
```

The LIVE indicator dot should have a proper pulse animation:
```css
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E8C97A;
  box-shadow: 0 0 8px rgba(232, 201, 122, 0.6);
  animation: livePulse 2s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(232, 201, 122, 0.6); }
  50% { opacity: 0.5; box-shadow: 0 0 4px rgba(232, 201, 122, 0.3); }
}
```

### 5C: Typography Refinements

- Phase name (h1): `letter-spacing: 0.08em` for ceremonial feel
- Subtitle (italic): Should use Cormorant Garamond italic, slightly larger tracking
- Data labels (PHASE ENERGY, FREQUENCIES, etc.): `letter-spacing: 0.2em`, `font-size: 0.65rem`, moonsilver/40 colour
- Frequency numbers: JetBrains Mono, large, with subtle text-shadow glow

### 5D: Frequency Play Buttons

The play buttons for frequencies should be distinctive:
- Circular, with a subtle ring border
- On press: radial pulse animation outward (like a sound wave)
- Active state: pulsing glow matching the frequency's energy

### 5E: Section Dividers

Between major sections, add subtle cosmic dividers:
```css
.cosmic-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(200, 196, 220, 0.1) 20%,
    rgba(232, 201, 122, 0.08) 50%,
    rgba(200, 196, 220, 0.1) 80%,
    transparent
  );
  margin: 2rem 0;
}
```

### 5F: Lunar Calendar Depth Enhancement

The calendar already looks great. Enhance with:
- Apply glass card treatment to the calendar container
- Current day cell: Subtle gold border glow, not just outline
- Full moon cells: Tiny radial glow behind the moon icon
- New moon cells: Slightly darker background
- Hover state: Gentle lift and brightness increase

---

## Phase 6: Zodiac Constellation Background

### 6A: Constellation Canvas

Behind the Zodiac Influence card, draw the current zodiac constellation using connected dots:
- Get constellation star positions for the current sign
- Draw as faint connected lines with dots at vertices
- Very subtle (0.04-0.08 opacity)
- Slowly rotating (one full rotation per 60 seconds)

This is a nice-to-have — implement after the core visual upgrades are done.

---

## Implementation Order

Execute in this exact order. Test deployment after each phase.

1. **Phase 3A + 3D first** — GlassCard + ScrollReveal (pure CSS). Apply to all cards. Push and verify.
2. **Phase 5A + 5B** — Deep space background + header HUD. Push and verify.
3. **Phase 2** — Starfield depth upgrade. Push and verify.
4. **Phase 1** — Moon WebGL upgrade (biggest change, highest risk). Push and verify.
5. **Phase 4** — Re-enable splash screen. Push and verify.
6. **Phase 5C-5F** — Typography, buttons, dividers, calendar polish. Push and verify.
7. **Phase 6** — Zodiac constellation (bonus). Push and verify.

---

## Technical Constraints

- **NO framer-motion** in page.tsx, cards, or scroll reveals. We removed it because it caused invisible rendering bugs. Use pure CSS animations + IntersectionObserver instead.
- **framer-motion is OK** inside isolated components that don't gate page rendering (e.g. small micro-interactions inside a card that's already visible).
- **Three.js** must use `dynamic(() => import(...), { ssr: false })` — it cannot run server-side.
- **All textures** go in `/public/textures/`. Always handle load failures gracefully.
- **Test on mobile** — most users will view this on phones. Performance matters.
- **Push command**: `git push origin master:main` — EVERY TIME.

---

## File Structure After Upgrade

```
src/
  components/
    MoonCanvas/
      MoonCanvas.tsx          ← Dynamic import wrapper
      MoonScene.tsx            ← Three.js scene (NEW)
      DeepStarfield.tsx        ← Particle starfield (NEW or integrated)
    ui/
      GlassCard.tsx            ← NEW
      ScrollReveal.tsx         ← NEW (replaces framer-motion version)
      CosmicDivider.tsx        ← NEW
    SplashScreen/
      SplashScreen.tsx         ← Already fixed (pure CSS)
    SessionPanel/              ← Apply GlassCard treatment
    Calendar/                  ← Apply glass + depth treatment
  app/
    page.tsx                   ← Already fixed (no framer-motion)
    globals.css                ← Add @property, keyframes, atmosphere styles
```

---

## Quality Bar

When finished, a user opening this app should:
1. See a ceremonial splash with crescent draw animation
2. The splash dissolves to reveal a BREATHTAKING photorealistic moon floating in deep space
3. Stars twinkle with depth — some far, some near, nebula wisps in the background
4. The moon breathes with a soft atmospheric glow
5. Scrolling reveals glass cards that float above the void with subtle animated borders
6. Every interaction feels intentional, sacred, and unlike any other app they've used
7. They should think: "This is the most beautiful wellness app I've ever seen"

That's the standard. Nothing less.
