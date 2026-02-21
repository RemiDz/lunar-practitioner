# Lunar Practitioner — Quick Fixes v2.2

## ⚠️ ALWAYS: `git push origin master:main`

---

## Fix 1: Settings Modal Broken (CRITICAL — DO THIS FIRST)

The settings modal no longer appears when clicking the settings button. This is most likely because:
- The CosmicBackground canvas has `position: fixed; inset: 0; z-index: 0` which may be intercepting clicks
- OR the modal's z-index is too low
- OR the modal's background is now transparent and invisible against the cosmic background

### Diagnosis Steps
1. Check `CosmicBackground.tsx` — the canvas MUST have `pointer-events: none` in its style. If missing, add it.
2. Check `SettingsModal.tsx` — find the modal wrapper. Ensure:
   - The backdrop overlay has `z-index: 100` or higher
   - The modal panel has `z-index: 101` or higher  
   - The backdrop has a visible background: `rgba(6, 6, 26, 0.85)`
   - The modal panel has the `glass-modal` class OR equivalent visible background

### Fix
In `src/components/Settings/SettingsModal.tsx`, ensure the modal structure looks like this:

```tsx
// Only render when open
if (!isOpen) return null;

return (
  <>
    {/* Backdrop — must be visible and clickable */}
    <div
      className="fixed inset-0 z-[100]"
      style={{
        background: 'rgba(6, 6, 26, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    />
    
    {/* Modal panel */}
    <div
      className="fixed z-[101] inset-x-4 top-[8vh] bottom-[8vh] mx-auto max-w-lg overflow-y-auto rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(240,238,248,0.05) 0%, rgba(200,196,220,0.08) 50%, rgba(240,238,248,0.03) 100%)',
        backdropFilter: 'blur(24px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
        border: '1px solid rgba(200,196,220,0.1)',
        boxShadow: '0 0 0 1px rgba(200,196,220,0.05) inset, 0 24px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top edge highlight */}
      <div
        style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(240,238,248,0.2), transparent)',
          pointerEvents: 'none',
        }}
      />
      
      <div className="relative p-6">
        {/* Close button */}
        <div className="flex items-center justify-between mb-6">
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
        
        {/* ... existing settings content ... */}
      </div>
    </div>
  </>
);
```

Key things to check:
- Modal must NOT be wrapped in any AnimatePresence or framer-motion component
- `isOpen` state must be properly connected to the settings button in page.tsx
- The modal renders via a portal or directly in the component tree — either is fine as long as z-index is 100+
- `onClick={e => e.stopPropagation()}` on the panel prevents backdrop click from closing when clicking inside

### After fixing: Commit and push.
```bash
git add -A && git commit -m "Fix: settings modal visibility and z-index" && git push origin master:main
```

### Verify: Click settings icon. Modal must appear with glass styling, cosmic background dimmed behind it. Clicking outside closes it. Clicking inside does not close it.

---

## Fix 2: Card Transparency — Stars Visible Through Glass

The cards should be slightly transparent so the cosmic starfield is faintly visible through them. On scroll-reveal entrance, cards should start MORE transparent and gradually become their final (still slightly transparent) state.

### Update glass-card in globals.css

Find the `.glass-card` class and update the background to be MORE transparent:

```css
.glass-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(240, 238, 248, 0.015) 0%,
    rgba(200, 196, 220, 0.035) 50%,
    rgba(240, 238, 248, 0.01) 100%
  );
  backdrop-filter: blur(16px) saturate(1.15);
  -webkit-backdrop-filter: blur(16px) saturate(1.15);
  border: 1px solid rgba(200, 196, 220, 0.07);
  box-shadow:
    0 0 0 1px rgba(200, 196, 220, 0.03) inset,
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.25);
  transition: background 1.2s ease-out, backdrop-filter 1.2s ease-out, border-color 0.8s ease-out;
}
```

The key changes:
- Background opacity reduced from 0.03/0.06/0.02 → 0.015/0.035/0.01
- Backdrop blur reduced from 20px → 16px (lets more stars through)
- Added `transition` so changes feel smooth

### Update ScrollReveal for the materialisation effect

In `src/components/ui/ScrollReveal.tsx` (or wherever scroll reveal is implemented), update the animation so cards start very transparent and fill in:

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
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '-30px' }
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
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
        filter: visible ? 'blur(0px)' : 'blur(4px)',
        transition: `opacity 0.9s ease-out ${delay}s, transform 0.9s ease-out ${delay}s, filter 1.2s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
```

The `filter: blur()` transition creates the materialisation effect — cards emerge from a soft blur into sharp focus, while simultaneously fading in and sliding up. This is the "split second of exceptional transparency" effect Remi described.

### After fixing: Commit and push.
```bash
git add -A && git commit -m "Card transparency: stars through glass, materialise on scroll" && git push origin master:main
```

---

## Fix 3: Developer Footer

Add a minimal, elegant footer at the very bottom of the page.

### Edit: `src/app/page.tsx`

After the last section (calendar) and before the closing `</main>` tag, add:

```tsx
{/* ── Footer ── */}
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
```

This sits at the bottom with the cosmic starfield visible behind it — minimal, elegant, matches the sacred aesthetic.

### After fixing: Commit and push.
```bash
git add -A && git commit -m "Add developer footer" && git push origin master:main
```

---

## Implementation Order

1. **Fix 1 — Settings modal** (critical, do first)
2. **Fix 3 — Footer** (quick, low risk)
3. **Fix 2 — Card transparency** (visual enhancement, test carefully)

After each: commit and `git push origin master:main`.
