'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { MoonData, ZodiacPosition } from '@/types/lunar';

interface MoonCanvasProps {
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
}

interface Star {
  x: number;
  y: number;
  r: number;
  brightness: number;
  twinkleOffset: number;
  twinkleSpeed: number;
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
  length: number;
}

function createStarSprite(size: number, brightness: number, hue?: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const s = Math.ceil(size * 2 + 4);
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const cx = s / 2;
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, size + 1);
  if (hue !== undefined && hue > 0) {
    const sat = hue === 220 ? 60 : 50;
    grad.addColorStop(0, `hsla(${hue}, ${sat}%, 85%, ${brightness})`);
    grad.addColorStop(0.3, `hsla(${hue}, ${sat}%, 85%, ${brightness * 0.5})`);
    grad.addColorStop(0.7, `hsla(${hue}, ${sat}%, 85%, ${brightness * 0.1})`);
    grad.addColorStop(1, 'transparent');
  } else {
    grad.addColorStop(0, `rgba(240, 238, 248, ${brightness})`);
    grad.addColorStop(0.3, `rgba(240, 238, 248, ${brightness * 0.5})`);
    grad.addColorStop(0.7, `rgba(240, 238, 248, ${brightness * 0.1})`);
    grad.addColorStop(1, 'transparent');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
  return c;
}

// Pre-rendered star sprites (keyed by size bucket)
interface StarSprites {
  white: HTMLCanvasElement[];
  blue: HTMLCanvasElement[];
  warm: HTMLCanvasElement[];
}

function createAllStarSprites(): StarSprites {
  const sizes = [1.5, 3, 5, 8];
  return {
    white: sizes.map(s => createStarSprite(s, 1)),
    blue: sizes.map(s => createStarSprite(s, 1, 220)),
    warm: sizes.map(s => createStarSprite(s, 1, 30)),
  };
}

function generateStars(w: number, h: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() < 0.02 ? Math.random() * 2 + 1.5 : Math.random() * 1.2 + 0.2,
      brightness: Math.random() * 0.7 + 0.3,
      twinkleOffset: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.002 * (0.5 + Math.random()),
      hue: Math.random() < 0.3 ? (Math.random() > 0.5 ? 220 : 30) : 0,
    });
  }
  return stars;
}

function generateMoonTexture(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = (x / size - 0.5) * 2;
      const dy = (y / size - 0.5) * 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        data[idx] = data[idx + 1] = data[idx + 2] = 0;
        data[idx + 3] = 0;
        continue;
      }

      const nz = Math.sqrt(1 - dist * dist);

      // Multi-scale noise
      let noise = 0;
      const scales = [0.02, 0.05, 0.1, 0.2];
      const weights = [0.4, 0.3, 0.2, 0.1];
      for (let i = 0; i < scales.length; i++) {
        noise += (Math.sin(x * scales[i] * 7.3 + y * scales[i] * 3.7) *
                  Math.cos(x * scales[i] * 4.1 - y * scales[i] * 6.3) + 1) * 0.5 * weights[i];
      }

      // Limb darkening
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

  ctx.putImageData(imageData, 0, 0);
  return c;
}

function drawMilkyWay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.35);
  const grad = ctx.createLinearGradient(0, -h * 0.1, 0, h * 0.1);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.2, 'rgba(180, 176, 210, 0.015)');
  grad.addColorStop(0.35, 'rgba(200, 196, 220, 0.04)');
  grad.addColorStop(0.5, 'rgba(210, 206, 230, 0.06)');
  grad.addColorStop(0.65, 'rgba(200, 196, 220, 0.04)');
  grad.addColorStop(0.8, 'rgba(180, 176, 210, 0.015)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(-w, -h * 0.1, w * 2, h * 0.2);
  const grad2 = ctx.createLinearGradient(0, -h * 0.2, 0, h * 0.2);
  grad2.addColorStop(0, 'transparent');
  grad2.addColorStop(0.4, 'rgba(160, 150, 200, 0.012)');
  grad2.addColorStop(0.6, 'rgba(160, 150, 200, 0.012)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(-w, -h * 0.2, w * 2, h * 0.4);
  ctx.restore();
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  illumination: number,
  frame: number,
  moonTexture: HTMLCanvasElement | null
) {
  const r = radius;

  // Breathing atmospheric glow
  const breathe = Math.sin(frame * 0.008) * 0.08 + 0.92;
  const glowLayers = [
    { radius: 2.2, opacity: 0.012 * illumination * breathe },
    { radius: 1.8, opacity: 0.025 * illumination * breathe },
    { radius: 1.5, opacity: 0.05 * illumination * breathe },
    { radius: 1.25, opacity: 0.08 * illumination * breathe },
  ];
  for (const layer of glowLayers) {
    const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * layer.radius);
    glow.addColorStop(0, `rgba(200, 196, 220, ${layer.opacity})`);
    glow.addColorStop(0.4, `rgba(200, 196, 220, ${layer.opacity * 0.5})`);
    glow.addColorStop(0.7, `rgba(180, 170, 210, ${layer.opacity * 0.2})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * layer.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden halo near full phases
  if (illumination > 0.4) {
    const goldIntensity = (illumination - 0.4) / 0.6;
    const goldBreathe = Math.sin(frame * 0.006 + 1) * 0.1 + 0.9;
    const goldGlow = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 1.6);
    goldGlow.addColorStop(0, `rgba(232, 201, 122, ${0.04 * goldIntensity * goldBreathe})`);
    goldGlow.addColorStop(0.5, `rgba(232, 201, 122, ${0.015 * goldIntensity * goldBreathe})`);
    goldGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = goldGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon disk — use procedural texture if available
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (moonTexture) {
    ctx.drawImage(moonTexture, cx - r, cy - r, r * 2, r * 2);
  } else {
    // Fallback flat gradient
    const baseGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.15, r * 0.05, cx + r * 0.1, cy + r * 0.05, r);
    baseGrad.addColorStop(0, '#e0dce8');
    baseGrad.addColorStop(0.35, '#b0acc0');
    baseGrad.addColorStop(0.7, '#807a90');
    baseGrad.addColorStop(1, '#504a60');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Limb darkening
  const vignette = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.6, 'rgba(0,0,0,0.03)');
  vignette.addColorStop(0.8, 'rgba(0,0,0,0.12)');
  vignette.addColorStop(0.95, 'rgba(0,0,0,0.35)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  // Terminator with soft penumbra
  const phaseAngle = phase * Math.PI * 2;
  const k = Math.cos(phaseAngle);
  const isWaxing = Math.sin(phaseAngle) >= 0;
  const steps = 80;

  for (let pass = 0; pass < 3; pass++) {
    const penumbraK = k + (isWaxing ? -1 : 1) * (0.04 - pass * 0.015);
    const penumbraAlpha = 0.15 + pass * 0.25;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    if (isWaxing) {
      ctx.moveTo(cx, cy - r);
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, true);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = Math.PI / 2 - t * Math.PI;
        ctx.lineTo(cx + penumbraK * r * Math.cos(angle), cy + r * Math.sin(angle));
      }
    } else {
      ctx.moveTo(cx, cy - r);
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = Math.PI / 2 - t * Math.PI;
        ctx.lineTo(cx + penumbraK * r * Math.cos(angle), cy + r * Math.sin(angle));
      }
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(5, 5, 15, ${penumbraAlpha})`;
    ctx.fill();
    ctx.restore();
  }

  // Main shadow
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  if (isWaxing) {
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, true);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = Math.PI / 2 - t * Math.PI;
      ctx.lineTo(cx + k * r * Math.cos(angle), cy + r * Math.sin(angle));
    }
  } else {
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = Math.PI / 2 - t * Math.PI;
      ctx.lineTo(cx + k * r * Math.cos(angle), cy + r * Math.sin(angle));
    }
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(5, 5, 15, 0.96)';
  ctx.fill();
  ctx.restore();

  // Earthshine on dark side
  if (illumination < 0.5) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.clip();
    const esX = isWaxing ? cx - r * 0.5 : cx + r * 0.5;
    const earthshine = ctx.createRadialGradient(esX, cy, r * 0.3, cx, cy, r);
    const esI = (0.5 - illumination) * 0.04;
    earthshine.addColorStop(0, `rgba(140, 160, 200, ${esI})`);
    earthshine.addColorStop(0.5, `rgba(100, 120, 160, ${esI * 0.3})`);
    earthshine.addColorStop(1, 'transparent');
    ctx.fillStyle = earthshine;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  // Bright limb edge
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(240, 238, 248, ${0.15 * illumination})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawPhaseArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  moonRadius: number,
  phase: number,
  illumination: number,
  frame: number
) {
  const arcRadius = moonRadius * 1.18;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI * 2 * phase;

  ctx.beginPath();
  ctx.arc(cx, cy, arcRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(200, 196, 220, 0.06)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (phase > 0.001) {
    ctx.beginPath();
    ctx.arc(cx, cy, arcRadius, startAngle, endAngle);
    ctx.strokeStyle = `rgba(200, 196, 220, ${0.08 + illumination * 0.08})`;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, arcRadius, startAngle, endAngle);
    ctx.strokeStyle = `rgba(232, 228, 244, ${0.3 + illumination * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    const dotX = cx + arcRadius * Math.cos(endAngle);
    const dotY = cy + arcRadius * Math.sin(endAngle);
    const dotPulse = Math.sin(frame * 0.03) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232, 201, 122, ${0.6 * dotPulse})`;
    ctx.fill();
  }
}

function updateShootingStars(ctx: CanvasRenderingContext2D, ss: ShootingStar[], w: number, h: number): ShootingStar[] {
  if (Math.random() < 0.001) {
    const angle = Math.random() * Math.PI * 0.4 + Math.PI * 0.3;
    const speed = 5 + Math.random() * 5;
    ss.push({
      x: Math.random() * w * 0.8 + w * 0.1,
      y: Math.random() * h * 0.4,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 90 + Math.random() * 40,
      length: 40 + Math.random() * 60,
    });
  }
  return ss.filter((s) => {
    s.x += s.dx;
    s.y += s.dy;
    s.life++;
    const progress = s.life / s.maxLife;
    const alpha = Math.min(progress * 5, 1) * Math.max(1 - (progress - 0.6) / 0.4, 0) * 0.7;
    if (alpha < 0.01) return false;
    const norm = Math.sqrt(s.dx * s.dx + s.dy * s.dy);
    const tailLen = s.length * (1 - progress * 0.3);
    const tailX = s.x - (s.dx / norm) * tailLen;
    const tailY = s.y - (s.dy / norm) * tailLen;
    const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.7, `rgba(220, 218, 240, ${alpha * 0.5})`);
    grad.addColorStop(1, `rgba(240, 238, 248, ${alpha})`);
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240, 238, 248, ${alpha})`;
    ctx.fill();
    return s.life < s.maxLife;
  });
}

export default function MoonCanvas({ moonData }: MoonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const prevSizeRef = useRef({ w: 0, h: 0 });
  const spritesRef = useRef<StarSprites | null>(null);
  const moonTextureRef = useRef<HTMLCanvasElement | null>(null);

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
    ctx.fillStyle = '#05050F';
    ctx.fillRect(0, 0, w, h);

    const spaceGrad = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.8);
    spaceGrad.addColorStop(0, 'rgba(15, 12, 35, 0.4)');
    spaceGrad.addColorStop(0.3, 'rgba(10, 10, 30, 0.2)');
    spaceGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    const minDim = Math.min(w, h);
    const moonRadius = minDim * 0.26;
    const cx = w / 2;
    const cy = h * 0.45;

    drawMilkyWay(ctx, w, h);

    const sprites = spritesRef.current;
    if (sprites) {
      for (const star of starsRef.current) {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness * (0.55 + 0.45 * twinkle);
        const dx = star.x - cx;
        const dy = star.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let fade = 1;
        if (dist < moonRadius * 1.5) fade = 0;
        else if (dist < moonRadius * 2.5) fade = (dist - moonRadius * 1.5) / moonRadius;
        const finalAlpha = alpha * fade;
        if (finalAlpha < 0.01) continue;

        // Pick sprite bucket based on star size
        const bucket = star.r < 0.6 ? 0 : star.r < 1.2 ? 1 : star.r < 2 ? 2 : 3;
        const spriteSet = star.hue === 220 ? sprites.blue : star.hue === 30 ? sprites.warm : sprites.white;
        const sprite = spriteSet[bucket];
        const spriteSize = sprite.width;

        ctx.globalAlpha = finalAlpha;
        ctx.drawImage(sprite, star.x - spriteSize / 2, star.y - spriteSize / 2);
      }
      ctx.globalAlpha = 1;
    }

    shootingStarsRef.current = updateShootingStars(ctx, shootingStarsRef.current, w, h);
    drawMoon(ctx, cx, cy, moonRadius, phase, illumination, frame, moonTextureRef.current);
    drawPhaseArc(ctx, cx, cy, moonRadius, phase, illumination, frame);

    rafRef.current = requestAnimationFrame(draw);
  }, [phase, illumination]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create star sprites and moon texture once
    if (!spritesRef.current) {
      spritesRef.current = createAllStarSprites();
    }
    if (!moonTextureRef.current) {
      moonTextureRef.current = generateMoonTexture(512);
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Only regenerate stars if size actually changed significantly
      if (Math.abs(w - prevSizeRef.current.w) < 5 && Math.abs(h - prevSizeRef.current.h) < 5) return;
      prevSizeRef.current = { w, h };

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      sizeRef.current = { w, h };
      starsRef.current = generateStars(w, h, 1000);
    };
    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#05050F' }}>
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
  );
}
