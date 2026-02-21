'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
  STAR_COUNT,
  STAR_TWINKLE_SPEED,
  STAR_PROXIMITY_FADE_RADIUS,
  MILKY_WAY_OPACITY,
  SHOOTING_STAR_CHANCE,
  DURATION_SHOOTING_STAR,
} from '@/lib/motion-constants';

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  twinkleOffset: number;
  twinkleSpeed: number;
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

interface StarFieldProps {
  /** Centre of the moon in normalised coords (0–1), for proximity fade */
  moonCentre?: { x: number; y: number };
  /** Moon radius as fraction of canvas width, for proximity fade */
  moonRadius?: number;
}

export default function StarField({ moonCentre, moonRadius = 0.12 }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  const centre = moonCentre ?? { x: 0.5, y: 0.45 };

  const initStars = useCallback((w: number, h: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.4 + 0.3,
        brightness: Math.random() * 0.7 + 0.3,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: STAR_TWINKLE_SPEED * (0.5 + Math.random()),
      });
    }
    starsRef.current = stars;
  }, []);

  const drawMilkyWay = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Diagonal band across sky
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.4); // slight tilt

    const gradient = ctx.createLinearGradient(0, -h * 0.08, 0, h * 0.08);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.3, `rgba(200, 196, 220, ${MILKY_WAY_OPACITY})`);
    gradient.addColorStop(0.5, `rgba(200, 196, 220, ${MILKY_WAY_OPACITY * 1.5})`);
    gradient.addColorStop(0.7, `rgba(200, 196, 220, ${MILKY_WAY_OPACITY})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(-w, -h * 0.08, w * 2, h * 0.16);
    ctx.restore();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const frame = frameRef.current++;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Milky Way band
    drawMilkyWay(ctx, w, h);

    // Moon centre in pixels
    const mcx = centre.x * w;
    const mcy = centre.y * h;
    const fadeR = STAR_PROXIMITY_FADE_RADIUS * w;

    // Draw stars
    for (const star of starsRef.current) {
      // Twinkle
      const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * (0.6 + 0.4 * twinkle);

      // Proximity fade — dim stars near the moon
      const dx = star.x - mcx;
      const dy = star.y - mcy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const moonR = moonRadius * w;
      let proximityFade = 1;
      if (dist < moonR) {
        proximityFade = 0;
      } else if (dist < moonR + fadeR) {
        proximityFade = (dist - moonR) / fadeR;
      }

      const finalAlpha = alpha * proximityFade;
      if (finalAlpha < 0.01) continue;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 238, 248, ${finalAlpha})`;
      ctx.fill();
    }

    // Shooting stars
    if (Math.random() < SHOOTING_STAR_CHANCE) {
      const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25;
      const speed = 4 + Math.random() * 4;
      shootingStarsRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 0,
        maxLife: DURATION_SHOOTING_STAR * 60,
        length: 30 + Math.random() * 40,
      });
    }

    shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
      s.x += s.dx;
      s.y += s.dy;
      s.life++;
      const progress = s.life / s.maxLife;
      const fadeIn = Math.min(progress * 4, 1);
      const fadeOut = 1 - progress;
      const alpha = fadeIn * fadeOut * 0.8;

      if (alpha < 0.01) return false;

      const tailX = s.x - s.dx * (s.length / 6);
      const tailY = s.y - s.dy * (s.length / 6);

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, `rgba(240, 238, 248, ${alpha})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      return s.life < s.maxLife;
    });

    rafRef.current = requestAnimationFrame(draw);
  }, [centre.x, centre.y, moonRadius, drawMilkyWay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      initStars(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initStars, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
