# Lunar Practitioner — Critical Visual Fixes v2.1

## ⚠️ ALWAYS: `git push origin master:main`

---

## Problem 1: Cards Float on Flat Black — No Depth

The glass cards look better but they're floating on pure black. There's no sense of SPACE behind them. The background needs atmospheric depth so the cards feel like they're hovering in a cosmic void, not sitting on a black webpage.

### Fix: Full-page Atmospheric Background

**File**: `src/app/globals.css`

Add these styles. The entire `<main>` element needs a layered atmospheric background that gives depth everywhere, not just behind the moon:

```css
/* Deep space atmosphere — applies to entire page */
.cosmic-atmosphere {
  background:
    /* Upper nebula glow — bleeds from moon area downward */
    radial-gradient(ellipse 80% 40% at 50% 15%, rgba(15, 12, 45, 0.6) 0%, transparent 100%),
    /* Left nebula wisp */
    radial-gradient(ellipse 40% 50% at 15% 60%, rgba(20, 15, 55, 0.25) 0%, transparent 100%),
    /* Right nebula wisp */
    radial-gradient(ellipse 35% 45% at 85% 45%, rgba(15, 18, 50, 0.2) 0%, transparent 100%),
    /* Lower depth zone */
    radial-gradient(ellipse 60% 30% at 50% 85%, rgba(12, 10, 35, 0.3) 0%, transparent 100%),
    /* Centre subtle warmth near cards */
    radial-gradient(ellipse 50% 35% at 50% 55%, rgba(25, 18, 45, 0.15) 0%, transparent 100%),
    /* Base void */
    #05050F;
}
```

**File**: `src/app/page.tsx`

Apply the class to `<main>`:
```tsx
<main className="min-h-screen cosmic-atmosphere text-selenite-white font-body">
```

### Fix: Subtle Particle Dust Behind Cards

Add a very subtle CSS-only floating dust effect to the card sections. This creates the feeling of particles drifting in space behind the glass:

**File**: `src/app/globals.css`

```css
/* Floating cosmic dust — subtle moving particles via CSS */
.cosmic-dust {
  position: relative;
}

.cosmic-dust::before {
  content: '';
  position: absolute;
  inset: -50px;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(200, 196, 220, 0.15) 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 70%, rgba(200, 196, 220, 0.1) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 20%, rgba(200, 196, 220, 0.12) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 50%, rgba(232, 201, 122, 0.08) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 10% 80%, rgba(200, 196, 220, 0.1) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 90%, rgba(200, 196, 220, 0.08) 0%, transparent 100%),
    radial-gradient(1px 1px at 90% 10%, rgba(232, 201, 122, 0.06) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 50%, rgba(200, 196, 220, 0.1) 0%, transparent 100%);
  background-size: 300px 300px;
  animation: dustDrift 60s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes dustDrift {
  0% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-30px) translateX(15px); }
  100% { transform: translateY(0) translateX(0); }
}
```

Wrap the card sections with cosmic-dust:
```tsx
<section className="max-w-3xl mx-auto px-6 pb-16 cosmic-dust">
  {/* cards go here — they need relative z-index to sit above the dust */}
  <div className="relative z-10">
    <SessionPanel ... />
  </div>
</section>
```

---

## Problem 2: Moon is Contained in a Visible Box

The moon section has a hard boundary — it looks like an animation embedded in a rectangle. The starfield abruptly stops where the section ends. This is the biggest visual problem. The moon's space needs to BLEED into the rest of the page seamlessly.

### Fix: Remove Moon Section Boundaries

**File**: `src/app/page.tsx`

The moon section currently has:
```tsx
<section className="relative w-full" style={{ height: '45vh', minHeight: 320 }}>
```

Change to — make it overflow and blend:
```tsx
<section
  className="relative w-full"
  style={{
    height: '50vh',
    minHeight: 360,
    marginBottom: '-60px',    /* overlap into content below */
    zIndex: 1,
  }}
>
```

### Fix: Fade the Moon Section Edges

**File**: `src/components/MoonCanvas/MoonCanvas.tsx`

The MoonCanvas container needs gradient masks on the edges so it blends into the page background:

Replace the outer container div with:
```tsx
<div className="relative w-full h-full overflow-hidden">
  <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
  {/* Bottom fade — blends into page content */}
  <div
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '120px',
      background: 'linear-gradient(to top, #05050F 0%, transparent 100%)',
      pointerEvents: 'none',
      zIndex: 2,
    }}
  />
  {/* Top fade — blends into header */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'linear-gradient(to bottom, #05050F 0%, transparent 100%)',
      pointerEvents: 'none',
      zIndex: 2,
    }}
  />
  {/* Left edge fade */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: '40px',
      background: 'linear-gradient(to right, #05050F 0%, transparent 100%)',
      pointerEvents: 'none',
      zIndex: 2,
    }}
  />
  {/* Right edge fade */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: '40px',
      background: 'linear-gradient(to left, #05050F 0%, transparent 100%)',
      pointerEvents: 'none',
      zIndex: 2,
    }}
  />
</div>
```

**IMPORTANT**: The fade colour MUST match the page background exactly (`#05050F`). If globals.css or the cosmic-atmosphere class changes the base colour, update these fades to match.

### Fix: Stars Jumping on Scroll

The current starfield canvas redraws stars at random positions when the page scrolls (because scroll triggers resize or re-render). Stars must be seeded ONCE and persist.

In MoonCanvas.tsx, ensure:
1. `generateStars()` is called ONLY in the resize handler, NOT on every frame
2. Stars are stored in a `useRef`, not state
3. The canvas does NOT re-mount on scroll — check that the parent section doesn't have any scroll-triggered state changes
4. If using `ResizeObserver`, debounce it: only regenerate stars if width/height actually changed by more than 5px

```tsx
const prevSizeRef = useRef({ w: 0, h: 0 });

const resize = () => {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  // Only regenerate if size actually changed significantly
  if (Math.abs(w - prevSizeRef.current.w) < 5 && Math.abs(h - prevSizeRef.current.h) < 5) return;
  prevSizeRef.current = { w, h };

  // ... rest of resize logic
  starsRef.current = generateStars(w, h, 1000);
};
```

Also: Remove `window.addEventListener('resize', resize)` if using `ResizeObserver`, or vice versa. Don't use both.

---

## Problem 3: Settings Modal Needs Glass Treatment

The settings modal currently uses default/generic styling. It should match the glass card aesthetic.

### Fix: Glass Settings Modal

**File**: `src/components/Settings/SettingsModal.tsx` (or wherever the modal is)

Apply this to the modal panel:

```tsx
{/* Backdrop */}
<div
  className="fixed inset-0 z-[100]"
  style={{
    background: 'rgba(5, 5, 15, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }}
  onClick={onClose}
/>

{/* Modal panel */}
<div
  className="fixed inset-x-4 top-[10vh] bottom-[10vh] z-[101] mx-auto max-w-lg overflow-y-auto rounded-2xl"
  style={{
    background: 'linear-gradient(135deg, rgba(240, 238, 248, 0.04) 0%, rgba(200, 196, 220, 0.07) 50%, rgba(240, 238, 248, 0.03) 100%)',
    backdropFilter: 'blur(24px) saturate(1.3)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
    border: '1px solid rgba(200, 196, 220, 0.1)',
    boxShadow: '0 0 0 1px rgba(200, 196, 220, 0.05) inset, 0 24px 80px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)',
  }}
>
  {/* Top edge highlight */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: '10%',
      right: '10%',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(240, 238, 248, 0.2), transparent)',
      pointerEvents: 'none',
    }}
  />

  {/* Modal content */}
  <div className="p-6 relative z-10">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <h2 className="font-display text-xl text-selenite-white tracking-wide">Settings</h2>
      <button
        onClick={onClose}
        className="text-moonsilver/50 hover:text-selenite-white transition-colors p-1"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    {/* Settings sections — each in its own subtle group */}
    {/* ... existing settings content ... */}
  </div>
</div>
```

**Settings form elements** should also match the aesthetic:

```css
/* Input fields inside settings */
.settings-input {
  background: rgba(200, 196, 220, 0.05);
  border: 1px solid rgba(200, 196, 220, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: #F0EEF8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.settings-input:focus {
  outline: none;
  border-color: rgba(232, 201, 122, 0.3);
  box-shadow: 0 0 12px rgba(232, 201, 122, 0.08);
}

/* Toggle switches */
.settings-toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: rgba(200, 196, 220, 0.1);
  border: 1px solid rgba(200, 196, 220, 0.15);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.settings-toggle.active {
  background: rgba(232, 201, 122, 0.2);
  border-color: rgba(232, 201, 122, 0.3);
}

.settings-toggle .knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #C8C4DC;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease, background 0.3s ease;
}

.settings-toggle.active .knob {
  transform: translateX(20px);
  background: #E8C97A;
}

/* Section dividers in settings */
.settings-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent);
  margin: 1.5rem 0;
}
```

**Modal entrance animation** (pure CSS):
```css
.modal-enter {
  animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-backdrop-enter {
  animation: backdropFade 0.3s ease-out forwards;
}

@keyframes backdropFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Problem 4: Moon Still Looks Primitive

If Three.js with NASA texture is not rendering properly (texture load fail, WebGL issues), the moon falls back to a flat gradient circle that looks like clip art. The moon MUST look exceptional regardless.

### Fix: Improve the Canvas2D Moon (if Three.js not used yet)

If you're still on Canvas2D (no Three.js), make these specific improvements to `MoonCanvas.tsx`:

**A. Surface texture via noise**

Add procedural noise to the moon surface instead of flat gradients:

```tsx
// Generate a noise texture once, cache it
function generateMoonTexture(size: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  // Simple multi-octave value noise
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Distance from centre (for spherical falloff)
      const dx = (x / size - 0.5) * 2;
      const dy = (y / size - 0.5) * 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        data[idx] = data[idx + 1] = data[idx + 2] = 0;
        data[idx + 3] = 0;
        continue;
      }

      // Spherical normal for lighting
      const nz = Math.sqrt(1 - dist * dist);

      // Multi-scale noise (poor man's perlin)
      let noise = 0;
      const scales = [0.02, 0.05, 0.1, 0.2];
      const weights = [0.4, 0.3, 0.2, 0.1];
      for (let i = 0; i < scales.length; i++) {
        noise += (Math.sin(x * scales[i] * 7.3 + y * scales[i] * 3.7) *
                  Math.cos(x * scales[i] * 4.1 - y * scales[i] * 6.3) + 1) * 0.5 * weights[i];
      }

      // Base brightness with limb darkening
      const limbFactor = Math.pow(nz, 0.4);
      const base = 140 + noise * 60;
      const brightness = base * limbFactor;

      // Slight colour variation (cooler at edges)
      const r = Math.min(255, brightness * 0.95);
      const g = Math.min(255, brightness * 0.93);
      const b = Math.min(255, brightness);

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  return imageData;
}
```

Generate this ONCE on mount (512x512 is enough), put it on an offscreen canvas, then `drawImage()` it each frame instead of drawing gradients. This gives the moon actual surface texture.

**B. The stars should NOT be hard circles**

Currently stars are drawn with `ctx.arc()` + `ctx.fill()` which makes hard-edged dots. Replace with a radial gradient per star for soft glow:

For performance, pre-render a star sprite to an offscreen canvas:

```tsx
function createStarSprite(size: number, brightness: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size * 2;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(size, size, 0, size, size, size);
  grad.addColorStop(0, `rgba(240, 238, 248, ${brightness})`);
  grad.addColorStop(0.3, `rgba(240, 238, 248, ${brightness * 0.5})`);
  grad.addColorStop(0.7, `rgba(240, 238, 248, ${brightness * 0.1})`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size * 2);
  return c;
}
```

Create 3-4 star sprites at init (different sizes), then `ctx.drawImage(sprite, x - r, y - r)` instead of `arc()+fill()`. This makes stars look like soft glowing points, not glitter dots.

**C. Stars must NOT move on scroll**

The canvas is inside a section that scrolls with the page. The canvas position is absolute within its parent, so it stays put. But if the draw loop references `getBoundingClientRect()` or window scroll position, stars will jump.

Check: The `draw()` function should NEVER call `getBoundingClientRect()`. It should only use `sizeRef.current` which is set once on resize.

Check: `resize` handler should NOT be triggered by scroll events. Use ONLY `window.addEventListener('resize', ...)` — NOT `ResizeObserver` on the canvas element (ResizeObserver can fire when the element enters/exits viewport during scroll).

---

## Implementation Order

1. **Cosmic atmosphere background** on `<main>` — immediate depth boost, 2 minutes of work
2. **Moon section edge fades** — remove the box feeling, 5 minutes
3. **Settings modal glass treatment** — apply styles from this spec
4. **Star rendering fix** — soft sprites instead of hard dots, fix scroll jumping
5. **Moon texture noise** — procedural surface if still on Canvas2D
6. **Cosmic dust behind cards** — floating particle CSS

After each step: commit and `git push origin master:main`.

---

## Quick Reference: What NOT to Do

- ❌ Do NOT use framer-motion in page.tsx or card wrappers
- ❌ Do NOT use `ResizeObserver` in MoonCanvas (causes scroll-triggered redraws)
- ❌ Do NOT draw stars with `ctx.arc()` + hard fill — use soft radial gradient sprites
- ❌ Do NOT leave hard edges on the moon section container
- ❌ Do NOT push to master without `origin master:main`
- ❌ Do NOT use pure black (#000000) anywhere — always use void-black (#05050F)
