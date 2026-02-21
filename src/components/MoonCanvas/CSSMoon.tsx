'use client';

/**
 * Pure CSS + Canvas2D moon with elliptical terminator.
 * Replaces the Three.js/R3F moon for universal browser support.
 */

import { useRef, useEffect } from 'react';

interface CSSMoonProps {
  phase: number;       // 0–1 suncalc phase (0 = new, 0.5 = full)
  illumination: number; // 0–1 illumination fraction
  diameter: number;     // px
}

export default function CSSMoon({ phase, illumination, diameter }: CSSMoonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const loadedRef = useRef(false);

  // Load the moon surface texture once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      textureRef.current = img;
      loadedRef.current = true;
      drawMoon();
    };
    img.src = '/textures/moon-surface.jpg';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw when phase, illumination, or diameter changes
  useEffect(() => {
    drawMoon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, illumination, diameter]);

  function drawMoon() {
    const canvas = canvasRef.current;
    if (!canvas || diameter <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const size = Math.round(diameter);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 1; // 1px inset to avoid clipping

    // ── 1. Draw the moon disk (texture or gradient fallback) ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (loadedRef.current && textureRef.current) {
      // Draw the texture, centred and covering the circle
      const img = textureRef.current;
      const aspect = img.width / img.height;
      let drawW = size;
      let drawH = size;
      if (aspect > 1) {
        drawH = size;
        drawW = size * aspect;
      } else {
        drawW = size;
        drawH = size / aspect;
      }
      const dx = cx - drawW / 2;
      const dy = cy - drawH / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    } else {
      // Fallback: grey gradient with subtle crater-like dots
      const grad = ctx.createRadialGradient(cx * 0.9, cy * 0.85, r * 0.1, cx, cy, r);
      grad.addColorStop(0, '#b0acc0');
      grad.addColorStop(0.5, '#8a8698');
      grad.addColorStop(1, '#5a5668');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    // ── 2. Limb darkening (radial vignette) ──
    const vignette = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(0.7, 'rgba(0,0,0,0.08)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, size, size);

    ctx.restore();

    // ── 3. Draw the terminator shadow ──
    // k = cos(phase * 2π): controls the terminator's x-radius on the disk
    // phase 0 (new):  k=1  → terminator at right limb → all dark
    // phase 0.25 (Q1): k=0  → terminator at centre → right half lit
    // phase 0.5 (full): k=-1 → terminator beyond limb → all lit
    const phaseAngle = phase * Math.PI * 2;
    const k = Math.cos(phaseAngle);
    const sinP = Math.sin(phaseAngle);
    const isWaxing = sinP >= 0;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Build the shadow path: one side is the limb arc, the other is the terminator ellipse
    ctx.beginPath();

    if (isWaxing) {
      // Waxing: shadow on the LEFT side
      // Shadow boundary: left limb arc (semicircle) + terminator ellipse on right
      // Left limb: arc from top to bottom on the left side
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false); // right semicircle — we want left
      // Actually: arc from bottom-left to top-left
      // Let me use a path: left limb arc + terminator ellipse

      // Left limb arc (from top to bottom, going left)
      ctx.moveTo(cx, cy - r);
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, true); // CCW = left semicircle

      // Terminator ellipse back from bottom to top
      // The terminator at height y: x_term = cx + k * sqrt(r² - (y-cy)²)
      // Draw as an ellipse from bottom to top
      const steps = 64;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = Math.PI / 2 - t * Math.PI; // from bottom (+π/2) to top (-π/2)
        const ly = cy + r * Math.sin(angle);
        const limbAtY = r * Math.cos(angle);
        const tx = cx + k * limbAtY;
        if (i === 0) {
          ctx.lineTo(tx, ly);
        } else {
          ctx.lineTo(tx, ly);
        }
      }

      ctx.closePath();
    } else {
      // Waning: shadow on the RIGHT side
      // Right limb arc + terminator ellipse on left

      // Right limb arc (from top to bottom, going right)
      ctx.moveTo(cx, cy - r);
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false); // CW = right semicircle

      // Terminator ellipse back from bottom to top
      const steps = 64;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = Math.PI / 2 - t * Math.PI; // from bottom to top
        const ly = cy + r * Math.sin(angle);
        const limbAtY = r * Math.cos(angle);
        const tx = cx + k * limbAtY;
        ctx.lineTo(tx, ly);
      }

      ctx.closePath();
    }

    // Fill shadow with near-black (slight earthshine transparency)
    ctx.fillStyle = 'rgba(5, 5, 15, 0.94)';
    ctx.fill();

    ctx.restore();
  }

  if (diameter <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: diameter,
        height: diameter,
        borderRadius: '50%',
      }}
    />
  );
}
