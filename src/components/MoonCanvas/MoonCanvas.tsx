'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { MoonData, ZodiacPosition } from '@/types/lunar';

interface MoonCanvasProps {
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
}

// ── Star generation ────────────────────────
interface Star {
  x: number;
  y: number;
  r: number;
  brightness: number;
  twinkleOffset: number;
  twinkleSpeed: number;
}

function generateStars(w: number, h: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      brightness: Math.random() * 0.7 + 0.3,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.002 * (0.5 + Math.random()),
    });
  }
  return stars;
}

// ── Moon terminator drawing ────────────────
function drawMoon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  illumination: number
) {
  const r = radius;

  // 1. Draw the lit moon disk
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Moon surface gradient (no texture needed)
  const surfaceGrad = ctx.createRadialGradient(
    cx - r * 0.15, cy - r * 0.1, r * 0.05,
    cx, cy, r
  );
  surfaceGrad.addColorStop(0, '#d4d0e8');
  surfaceGrad.addColorStop(0.3, '#b8b4c8');
  surfaceGrad.addColorStop(0.6, '#9a96a8');
  surfaceGrad.addColorStop(0.85, '#7a7688');
  surfaceGrad.addColorStop(1, '#5a5668');
  ctx.fillStyle = surfaceGrad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // Subtle crater-like marks
  const craters = [
    { x: 0.3, y: 0.25, s: 0.08, a: 0.06 },
    { x: 0.65, y: 0.55, s: 0.12, a: 0.08 },
    { x: 0.45, y: 0.7, s: 0.07, a: 0.05 },
    { x: 0.25, y: 0.55, s: 0.09, a: 0.05 },
    { x: 0.75, y: 0.3, s: 0.06, a: 0.04 },
    { x: 0.55, y: 0.35, s: 0.1, a: 0.06 },
    { x: 0.35, y: 0.45, s: 0.14, a: 0.07 },
    { x: 0.6, y: 0.75, s: 0.08, a: 0.05 },
  ];

  for (const c of craters) {
    const craterGrad = ctx.createRadialGradient(
      cx - r + c.x * 2 * r, cy - r + c.y * 2 * r, 0,
      cx - r + c.x * 2 * r, cy - r + c.y * 2 * r, c.s * r
    );
    craterGrad.addColorStop(0, `rgba(0,0,0,${c.a})`);
    craterGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = craterGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Limb darkening
  const vignette = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.7, 'rgba(0,0,0,0.08)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  ctx.restore();

  // 2. Draw the terminator shadow
  const phaseAngle = phase * Math.PI * 2;
  const k = Math.cos(phaseAngle);
  const isWaxing = Math.sin(phaseAngle) >= 0;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  ctx.beginPath();
  const steps = 64;

  if (isWaxing) {
    // Shadow on the LEFT: left limb arc + terminator curve
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, true); // left semicircle (CCW)
    // Terminator ellipse from bottom to top
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = Math.PI / 2 - t * Math.PI;
      const ly = cy + r * Math.sin(angle);
      const limbAtY = r * Math.cos(angle);
      ctx.lineTo(cx + k * limbAtY, ly);
    }
  } else {
    // Shadow on the RIGHT: right limb arc + terminator curve
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false); // right semicircle (CW)
    // Terminator ellipse from bottom to top
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = Math.PI / 2 - t * Math.PI;
      const ly = cy + r * Math.sin(angle);
      const limbAtY = r * Math.cos(angle);
      ctx.lineTo(cx + k * limbAtY, ly);
    }
  }

  ctx.closePath();
  ctx.fillStyle = 'rgba(5, 5, 15, 0.94)';
  ctx.fill();
  ctx.restore();

  // 3. Halo glow (pure CSS-like radial glow)
  const glowIntensity = illumination * 0.25;
  if (glowIntensity > 0.01) {
    const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 1.4);
    glow.addColorStop(0, `rgba(200, 196, 220, ${glowIntensity})`);
    glow.addColorStop(0.5, `rgba(200, 196, 220, ${glowIntensity * 0.4})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Phase arc drawing ──────────────────────
function drawPhaseArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  moonRadius: number,
  phase: number
) {
  const arcRadius = moonRadius * 1.15;
  const progress = phase;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI * 2 * progress;

  // Background track
  ctx.beginPath();
  ctx.arc(cx, cy, arcRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200, 196, 220, 0.08)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Progress arc
  if (progress > 0.001) {
    ctx.beginPath();
    ctx.arc(cx, cy, arcRadius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(200, 196, 220, 0.4)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

export default function MoonCanvas({ moonData, zodiacPosition }: MoonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const phase = moonData?.phase ?? 0;
  const illumination = moonData?.illumination ?? 0;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;

    const frame = frameRef.current++;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Moon sizing
    const minDim = Math.min(w, h);
    const moonRadius = minDim * 0.25;
    const cx = w / 2;
    const cy = h * 0.45;

    // Draw stars with twinkle
    for (const star of starsRef.current) {
      const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * (0.6 + 0.4 * twinkle);

      // Fade stars near moon
      const dx = star.x - cx;
      const dy = star.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let fade = 1;
      if (dist < moonRadius * 1.3) fade = 0;
      else if (dist < moonRadius * 2) fade = (dist - moonRadius * 1.3) / (moonRadius * 0.7);

      const finalAlpha = alpha * fade;
      if (finalAlpha < 0.01) continue;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 238, 248, ${finalAlpha})`;
      ctx.fill();
    }

    // Draw subtle milky way band
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.4);
    const mwGrad = ctx.createLinearGradient(0, -h * 0.08, 0, h * 0.08);
    mwGrad.addColorStop(0, 'transparent');
    mwGrad.addColorStop(0.3, 'rgba(200, 196, 220, 0.04)');
    mwGrad.addColorStop(0.5, 'rgba(200, 196, 220, 0.06)');
    mwGrad.addColorStop(0.7, 'rgba(200, 196, 220, 0.04)');
    mwGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mwGrad;
    ctx.fillRect(-w, -h * 0.08, w * 2, h * 0.16);
    ctx.restore();

    // Draw moon
    drawMoon(ctx, cx, cy, moonRadius, phase, illumination);

    // Draw phase arc
    drawPhaseArc(ctx, cx, cy, moonRadius, phase);

    rafRef.current = requestAnimationFrame(draw);
  }, [phase, illumination]);

  // Setup canvas and resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      sizeRef.current = { w, h };
      starsRef.current = generateStars(w, h, 800);
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
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#05050F' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
