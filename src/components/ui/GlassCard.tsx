'use client';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'silver' | 'gold' | 'phase';
  intensity?: 'subtle' | 'medium' | 'strong';
}

export default function GlassCard({
  children,
  className = '',
  glow = 'silver',
  intensity = 'subtle',
}: GlassCardProps) {
  const glowMap = {
    silver: 'rgba(200, 196, 220, 0.08)',
    gold: 'rgba(232, 201, 122, 0.08)',
    phase: 'rgba(200, 196, 220, 0.06)',
  };
  const intensityMap = {
    subtle: 0.03,
    medium: 0.06,
    strong: 0.1,
  };

  return (
    <div
      className={`glass-card ${className}`}
      style={{
        '--card-glow': glowMap[glow],
        '--card-intensity': intensityMap[intensity],
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
