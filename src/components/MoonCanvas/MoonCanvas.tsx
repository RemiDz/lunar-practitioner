'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { MoonData, ZodiacPosition } from '@/types/lunar';

interface MoonCanvasProps {
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
}

// ── Types ──────────────────────────────────
interface Star {
  x: number;
  y: number;
  size: number;       // sprite index (0=tiny, 1=small, 2=medium, 3=bright)
  brightness: number;
  twinkleOffset: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number; y: number;
  dx: number; dy: number;
  life: number; maxLife: number;
  length: number;
}

// ── Seeded random for deterministic star placement ──
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Pre-render soft star sprites (4 sizes) ──
function createStarSprites(): HTMLCanvasElement[] {
  const sizes = [3, 5, 8, 12]; // pixel diameters
  return sizes.map((d) => {
    const c = document.createElement('canvas');
    c.width = c.height = d * 2;
    const ctx = c.getContext('2d')!;
    const cx = d, cy = d, r = d * 0.8;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(240, 238, 248, 1)');
    grad.addColorStop(0.15, 'rgba(240, 238, 248, 0.7)');
    grad.addColorStop(0.4, 'rgba(230, 228, 244, 0.25)');
    grad.addColorStop(0.7, 'rgba(220, 218, 240, 0.06)');
    grad.addColorStop(1, 'rgba(220, 218, 240, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, d * 2, d * 2);
    return c;
  });
}

// ── Pre-render moon surface texture (offscreen) ──
function createMoonTexture(texSize: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = texSize;
  const ctx = c.getContext('2d')!;
  const cx = texSize / 2, cy = texSize / 2, r = texSize / 2;

  // 1. Base sphere gradient — warm centre, cooler edges
  const base = ctx.createRadialGradient(cx - r * 0.15, cy - r * 0.1, r * 0.05, cx, cy, r);
  base.addColorStop(0, '#d8d4e4');
  base.addColorStop(0.2, '#c8c4d4');
  base.addColorStop(0.45, '#aba7b8');
  base.addColorStop(0.65, '#908c9c');
  base.addColorStop(0.82, '#706c7c');
  base.addColorStop(0.95, '#504c5c');
  base.addColorStop(1, '#383440');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // 2. Maria — the recognizable dark "seas" of the moon
  // Painted as soft ellipses with multiple layers for natural edges
  const maria = [
    // Mare Imbrium — large, upper left
    { x: 0.34, y: 0.30, rx: 0.14, ry: 0.12, rot: -0.15, a: 0.18 },
    { x: 0.32, y: 0.28, rx: 0.10, ry: 0.09, rot: -0.1, a: 0.08 },
    // Oceanus Procellarum — large, left side
    { x: 0.26, y: 0.48, rx: 0.13, ry: 0.20, rot: -0.08, a: 0.14 },
    { x: 0.24, y: 0.52, rx: 0.09, ry: 0.14, rot: 0, a: 0.06 },
    // Mare Serenitatis — upper centre-right
    { x: 0.53, y: 0.30, rx: 0.08, ry: 0.09, rot: 0.1, a: 0.16 },
    // Mare Tranquillitatis — centre-right
    { x: 0.57, y: 0.43, rx: 0.10, ry: 0.09, rot: 0.25, a: 0.15 },
    { x: 0.55, y: 0.45, rx: 0.07, ry: 0.06, rot: 0.2, a: 0.06 },
    // Mare Crisium — isolated right
    { x: 0.72, y: 0.33, rx: 0.05, ry: 0.065, rot: 0.3, a: 0.18 },
    // Mare Nubium — lower centre
    { x: 0.40, y: 0.62, rx: 0.09, ry: 0.07, rot: 0.05, a: 0.12 },
    // Mare Fecunditatis — lower right
    { x: 0.64, y: 0.56, rx: 0.07, ry: 0.06, rot: 0.15, a: 0.10 },
    // Mare Humorum — small, lower left
    { x: 0.30, y: 0.68, rx: 0.05, ry: 0.05, rot: 0, a: 0.12 },
    // Mare Frigoris — thin strip, top
    { x: 0.42, y: 0.16, rx: 0.18, ry: 0.03, rot: -0.05, a: 0.07 },
  ];

  for (const m of maria) {
    ctx.save();
    const mx = cx - r + m.x * 2 * r;
    const my = cy - r + m.y * 2 * r;
    ctx.translate(mx, my);
    ctx.rotate(m.rot);
    const maxR = Math.max(m.rx, m.ry) * r * 1.3;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR);
    grad.addColorStop(0, `rgba(22, 18, 38, ${m.a})`);
    grad.addColorStop(0.4, `rgba(22, 18, 38, ${m.a * 0.7})`);
    grad.addColorStop(0.7, `rgba(22, 18, 38, ${m.a * 0.3})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, m.rx * r * 1.3, m.ry * r * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Surface variation — hundreds of tiny soft spots for micro-texture
  // NOT sine waves — use seeded random positions
  const rng = seededRandom(42);
  for (let i = 0; i < 600; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * r * 0.92;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const sr = 2 + rng() * 8;
    const dark = rng() > 0.5;
    const opacity = 0.02 + rng() * 0.04;

    const spotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    if (dark) {
      spotGrad.addColorStop(0, `rgba(15, 12, 30, ${opacity})`);
    } else {
      spotGrad.addColorStop(0, `rgba(220, 216, 235, ${opacity * 0.6})`);
    }
    spotGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Notable craters — bright rings with dark centres
  const craters = [
    { x: 0.42, y: 0.78, s: 0.02 },  // Tycho
    { x: 0.35, y: 0.20, s: 0.015 },  // Copernicus
    { x: 0.58, y: 0.14, s: 0.012 },  // Aristoteles
    { x: 0.68, y: 0.65, s: 0.01 },
    { x: 0.22, y: 0.38, s: 0.013 },
    { x: 0.50, y: 0.52, s: 0.008 },
  ];

  for (const cr of craters) {
    const crx = cx - r + cr.x * 2 * r;
    const cry = cy - r + cr.y * 2 * r;
    const crr = cr.s * r * 2;
    // Dark centre
    const cGrad = ctx.createRadialGradient(crx, cry, 0, crx, cry, crr);
    cGrad.addColorStop(0, 'rgba(15, 12, 30, 0.12)');
    cGrad.addColorStop(0.5, 'rgba(15, 12, 30, 0.06)');
    cGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(crx, cry, crr, 0, Math.PI * 2);
    ctx.fill();
    // Bright rim (upper-left lit)
    const rimGrad = ctx.createRadialGradient(crx - crr * 0.3, cry - crr * 0.3, crr * 0.6, crx, cry, crr * 1.2);
    rimGrad.addColorStop(0, 'rgba(210, 206, 225, 0.06)');
    rimGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(crx, cry, crr * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Limb darkening — vignette that makes edges dark like a real sphere
  const vignette = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.55, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.75, 'rgba(0,0,0,0.08)');
  vignette.addColorStop(0.88, 'rgba(0,0,0,0.25)');
  vignette.addColorStop(0.96, 'rgba(0,0,0,0.45)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vignette;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

// ── Star generation (deterministic) ──
function generateStars(w: number, h: number): Star[] {
  const rng = seededRandom(12345);
  const stars: Star[] = [];

  // Far layer — many tiny dim stars
  for (let i = 0; i < 700; i++) {
    stars.push({
      x: rng() * w, y: rng() * h,
      size: 0, brightness: 0.15 + rng() * 0.25,
      twinkleOffset: rng() * Math.PI * 2,
      twinkleSpeed: 0.001 + rng() * 0.001,
    });
  }
  // Mid layer — moderate
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: rng() * w, y: rng() * h,
      size: 1, brightness: 0.25 + rng() * 0.35,
      twinkleOffset: rng() * Math.PI * 2,
      twinkleSpeed: 0.0015 + rng() * 0.0015,
    });
  }
  // Near layer — few bright stars
  for (let i = 0; i < 40; i++) {
    stars.push({
      x: rng() * w, y: rng() * h,
      size: 2, brightness: 0.4 + rng() * 0.4,
      twinkleOffset: rng() * Math.PI * 2,
      twinkleSpeed: 0.002 + rng() * 0.002,
    });
  }
  // Rare bright stars
  for (let i = 0; i < 8; i++) {
    stars.push({
      x: rng() * w, y: rng() * h,
      size: 3, brightness: 0.6 + rng() * 0.4,
      twinkleOffset: rng() * Math.PI * 2,
      twinkleSpeed: 0.003 + rng() * 0.001,
    });
  }

  return stars;
}

// ── Main Component ─────────────────────────
export default function MoonCanvas({ moonData }: MoonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const spritesRef = useRef<HTMLCanvasElement[]>([]);
  const moonTexRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const prevSizeRef = useRef({ w: 0, h: 0 });

  const phase = moonData?.phase ?? 0;
  const illumination = moonData?.illumination ?? 0;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) { rafRef.current = requestAnimationFrame(draw); return; }

    const frame = frameRef.current++;
    const sprites = spritesRef.current;
    const moonTex = moonTexRef.current;

    // ── Clear with void ──
    ctx.fillStyle = '#05050F';
    ctx.fillRect(0, 0, w, h);

    // ── Deep space atmosphere ──
    const spaceGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.9);
    spaceGrad.addColorStop(0, 'rgba(18, 14, 42, 0.35)');
    spaceGrad.addColorStop(0.25, 'rgba(12, 10, 32, 0.2)');
    spaceGrad.addColorStop(0.5, 'rgba(8, 8, 22, 0.1)');
    spaceGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // ── Subtle nebula wisps ──
    ctx.save();
    ctx.globalAlpha = 0.025;
    ctx.translate(w * 0.7, h * 0.3);
    ctx.rotate(-0.5);
    const neb1 = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.3);
    neb1.addColorStop(0, 'rgba(60, 40, 100, 1)');
    neb1.addColorStop(0.5, 'rgba(40, 30, 80, 0.5)');
    neb1.addColorStop(1, 'transparent');
    ctx.fillStyle = neb1;
    ctx.fillRect(-w * 0.3, -w * 0.3, w * 0.6, w * 0.6);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.015;
    ctx.translate(w * 0.2, h * 0.7);
    const neb2 = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.25);
    neb2.addColorStop(0, 'rgba(30, 40, 80, 1)');
    neb2.addColorStop(1, 'transparent');
    ctx.fillStyle = neb2;
    ctx.fillRect(-w * 0.25, -w * 0.25, w * 0.5, w * 0.5);
    ctx.restore();

    // ── Moon calculations ──
    const minDim = Math.min(w, h);
    const moonRadius = minDim * 0.26;
    const cx = w / 2;
    const cy = h * 0.44;

    // ── Stars ──
    for (const star of starsRef.current) {
      // Proximity fade around moon
      const dx = star.x - cx;
      const dy = star.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let fade = 1;
      if (dist < moonRadius * 1.6) fade = 0;
      else if (dist < moonRadius * 2.8) fade = (dist - moonRadius * 1.6) / (moonRadius * 1.2);

      // Twinkle
      const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * (0.5 + 0.5 * twinkle) * fade;
      if (alpha < 0.01) continue;

      const sprite = sprites[star.size];
      if (!sprite) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      const spriteW = sprite.width;
      ctx.drawImage(sprite, star.x - spriteW / 2, star.y - spriteW / 2);
      ctx.restore();
    }

    // ── Shooting stars ──
    if (Math.random() < 0.0005) {
      const angle = Math.random() * Math.PI * 0.3 + Math.PI * 0.35;
      const speed = 4 + Math.random() * 4;
      shootingStarsRef.current.push({
        x: Math.random() * w * 0.7 + w * 0.15,
        y: Math.random() * h * 0.35,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 0, maxLife: 80 + Math.random() * 50,
        length: 50 + Math.random() * 70,
      });
    }
    shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
      s.x += s.dx; s.y += s.dy; s.life++;
      const p = s.life / s.maxLife;
      const alpha = Math.min(p * 6, 1) * Math.max(1 - (p - 0.5) / 0.5, 0) * 0.6;
      if (alpha < 0.005) return false;
      const norm = Math.sqrt(s.dx * s.dx + s.dy * s.dy);
      const tailLen = s.length * (1 - p * 0.4);
      const tx = s.x - (s.dx / norm) * tailLen;
      const ty = s.y - (s.dy / norm) * tailLen;
      const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.6, `rgba(210, 208, 235, ${alpha * 0.3})`);
      grad.addColorStop(0.9, `rgba(240, 238, 248, ${alpha * 0.7})`);
      grad.addColorStop(1, `rgba(240, 238, 248, ${alpha})`);
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad; ctx.lineWidth = 1; ctx.stroke();
      return s.life < s.maxLife;
    });

    // ── Atmospheric glow (breathing) ──
    const breathe = Math.sin(frame * 0.006) * 0.06 + 0.94;
    const glowLayers = [
      { r: 2.5, o: 0.008 }, { r: 2.0, o: 0.018 },
      { r: 1.6, o: 0.035 }, { r: 1.3, o: 0.06 },
    ];
    for (const g of glowLayers) {
      const glow = ctx.createRadialGradient(cx, cy, moonRadius * 0.3, cx, cy, moonRadius * g.r);
      const op = g.o * illumination * breathe;
      glow.addColorStop(0, `rgba(200, 196, 220, ${op})`);
      glow.addColorStop(0.5, `rgba(190, 185, 215, ${op * 0.4})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, moonRadius * g.r, 0, Math.PI * 2); ctx.fill();
    }

    // Golden warmth near full
    if (illumination > 0.35) {
      const gi = (illumination - 0.35) / 0.65;
      const gb = Math.sin(frame * 0.005 + 0.7) * 0.08 + 0.92;
      const gold = ctx.createRadialGradient(cx, cy, moonRadius * 0.8, cx, cy, moonRadius * 1.8);
      gold.addColorStop(0, `rgba(232, 201, 122, ${0.03 * gi * gb})`);
      gold.addColorStop(0.6, `rgba(232, 201, 122, ${0.01 * gi * gb})`);
      gold.addColorStop(1, 'transparent');
      ctx.fillStyle = gold;
      ctx.beginPath(); ctx.arc(cx, cy, moonRadius * 1.8, 0, Math.PI * 2); ctx.fill();
    }

    // ── Draw moon from pre-rendered texture ──
    if (moonTex) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(moonTex, cx - moonRadius, cy - moonRadius, moonRadius * 2, moonRadius * 2);
      ctx.restore();
    }

    // ── Terminator shadow ──
    const phaseAngle = phase * Math.PI * 2;
    const k = Math.cos(phaseAngle);
    const isWaxing = Math.sin(phaseAngle) >= 0;
    const steps = 90;

    // Soft penumbra passes
    const penumbraPasses = [
      { offset: 0.06, alpha: 0.10 },
      { offset: 0.04, alpha: 0.20 },
      { offset: 0.02, alpha: 0.35 },
      { offset: 0.008, alpha: 0.55 },
    ];

    for (const pp of penumbraPasses) {
      const pk = k + (isWaxing ? -1 : 1) * pp.offset;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2); ctx.clip();
      ctx.beginPath();
      if (isWaxing) {
        ctx.moveTo(cx, cy - moonRadius);
        ctx.arc(cx, cy, moonRadius, -Math.PI / 2, Math.PI / 2, true);
        for (let i = 0; i <= steps; i++) {
          const a = Math.PI / 2 - (i / steps) * Math.PI;
          ctx.lineTo(cx + pk * moonRadius * Math.cos(a), cy + moonRadius * Math.sin(a));
        }
      } else {
        ctx.moveTo(cx, cy - moonRadius);
        ctx.arc(cx, cy, moonRadius, -Math.PI / 2, Math.PI / 2, false);
        for (let i = 0; i <= steps; i++) {
          const a = Math.PI / 2 - (i / steps) * Math.PI;
          ctx.lineTo(cx + pk * moonRadius * Math.cos(a), cy + moonRadius * Math.sin(a));
        }
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(5, 5, 15, ${pp.alpha})`;
      ctx.fill(); ctx.restore();
    }

    // Hard shadow
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2); ctx.clip();
    ctx.beginPath();
    if (isWaxing) {
      ctx.moveTo(cx, cy - moonRadius);
      ctx.arc(cx, cy, moonRadius, -Math.PI / 2, Math.PI / 2, true);
      for (let i = 0; i <= steps; i++) {
        const a = Math.PI / 2 - (i / steps) * Math.PI;
        ctx.lineTo(cx + k * moonRadius * Math.cos(a), cy + moonRadius * Math.sin(a));
      }
    } else {
      ctx.moveTo(cx, cy - moonRadius);
      ctx.arc(cx, cy, moonRadius, -Math.PI / 2, Math.PI / 2, false);
      for (let i = 0; i <= steps; i++) {
        const a = Math.PI / 2 - (i / steps) * Math.PI;
        ctx.lineTo(cx + k * moonRadius * Math.cos(a), cy + moonRadius * Math.sin(a));
      }
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(5, 5, 15, 0.97)';
    ctx.fill(); ctx.restore();

    // Earthshine on dark side (crescent phases)
    if (illumination < 0.45) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, moonRadius - 1, 0, Math.PI * 2); ctx.clip();
      const esX = isWaxing ? cx - moonRadius * 0.4 : cx + moonRadius * 0.4;
      const es = ctx.createRadialGradient(esX, cy, moonRadius * 0.2, cx, cy, moonRadius);
      const esI = (0.45 - illumination) * 0.035;
      es.addColorStop(0, `rgba(120, 140, 190, ${esI})`);
      es.addColorStop(0.6, `rgba(90, 110, 160, ${esI * 0.2})`);
      es.addColorStop(1, 'transparent');
      ctx.fillStyle = es;
      ctx.fillRect(cx - moonRadius, cy - moonRadius, moonRadius * 2, moonRadius * 2);
      ctx.restore();
    }

    // Thin bright limb
    ctx.beginPath(); ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220, 218, 240, ${0.08 + illumination * 0.08})`;
    ctx.lineWidth = 0.8; ctx.stroke();

    // ── Phase arc ring ──
    const arcR = moonRadius * 1.2;
    const startA = -Math.PI / 2;
    const endA = startA + Math.PI * 2 * phase;

    // Track
    ctx.beginPath(); ctx.arc(cx, cy, arcR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200, 196, 220, 0.05)'; ctx.lineWidth = 1; ctx.stroke();

    if (phase > 0.002) {
      // Glow
      ctx.beginPath(); ctx.arc(cx, cy, arcR, startA, endA);
      ctx.strokeStyle = `rgba(200, 196, 220, ${0.06 + illumination * 0.06})`;
      ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
      // Core
      ctx.beginPath(); ctx.arc(cx, cy, arcR, startA, endA);
      ctx.strokeStyle = `rgba(230, 226, 244, ${0.25 + illumination * 0.25})`;
      ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.stroke();
      // End dot
      const dotPulse = Math.sin(frame * 0.025) * 0.25 + 0.75;
      ctx.beginPath();
      ctx.arc(cx + arcR * Math.cos(endA), cy + arcR * Math.sin(endA), 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 201, 122, ${0.5 * dotPulse})`; ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [phase, illumination]);

  // ── Setup ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create star sprites once
    if (spritesRef.current.length === 0) {
      spritesRef.current = createStarSprites();
    }

    // Create moon texture once
    if (!moonTexRef.current) {
      moonTexRef.current = createMoonTexture(512);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Only regenerate if size actually changed
      if (Math.abs(w - prevSizeRef.current.w) < 3 && Math.abs(h - prevSizeRef.current.h) < 3) return;
      prevSizeRef.current = { w, h };

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      sizeRef.current = { w, h };
      starsRef.current = generateStars(w, h);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div className="relative w-full h-full overflow-visible">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {/* Bottom fade — blends moon space into page content */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px',
          background: 'linear-gradient(to top, #05050F 0%, rgba(5,5,15,0.6) 40%, transparent 100%)',
          pointerEvents: 'none', zIndex: 2,
        }}
      />
      {/* Top fade — blends into header */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50px',
          background: 'linear-gradient(to bottom, rgba(5,5,15,0.7) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 2,
        }}
      />
    </div>
  );
}
