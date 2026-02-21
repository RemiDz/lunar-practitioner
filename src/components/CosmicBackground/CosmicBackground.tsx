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
