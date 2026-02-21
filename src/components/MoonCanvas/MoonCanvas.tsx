'use client';

import { useRef, useState, useEffect } from 'react';
import StarField from './StarField';
import MoonHalo from './MoonHalo';
import PhaseArc from './PhaseArc';
import ZodiacConstellation from './ZodiacConstellation';
import CSSMoon from './CSSMoon';
import type { MoonData, ZodiacPosition } from '@/types/lunar';

interface MoonCanvasProps {
  moonData: MoonData | null;
  zodiacPosition: ZodiacPosition | null;
}

export default function MoonCanvas({ moonData, zodiacPosition }: MoonCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Moon size: 55% of the smaller dimension
  const minDim = Math.min(dimensions.width, dimensions.height);
  const moonDiameter = minDim * 0.55;
  const moonRadius = moonDiameter / 2;

  // Normalised moon radius as fraction of width (for star proximity fade)
  const normRadius = dimensions.width > 0 ? moonRadius / dimensions.width : 0.12;

  const phase = moonData?.phase ?? 0;
  const illumination = moonData?.illumination ?? 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: 'var(--void-black)' }}
    >
      {/* z-0: Star field */}
      <StarField
        moonCentre={{ x: 0.5, y: 0.45 }}
        moonRadius={normRadius}
      />

      {/* z-1: Zodiac constellation (behind moon) */}
      {zodiacPosition && dimensions.width > 0 && (
        <ZodiacConstellation
          sign={zodiacPosition.signName}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          moonDiameter={moonDiameter}
        />
      )}

      {/* z-2: Moon halo glow */}
      <MoonHalo
        phase={phase}
        illumination={illumination}
        moonDiameter={moonDiameter}
        isSupermoon={false}
      />

      {/* z-3: CSS moon orb */}
      {dimensions.width > 0 && (
        <div
          className="absolute"
          style={{
            zIndex: 3,
            left: '50%',
            top: '45%',
            width: moonDiameter,
            height: moonDiameter,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CSSMoon
            phase={phase}
            illumination={illumination}
            diameter={moonDiameter}
          />
        </div>
      )}

      {/* z-4: Phase arc */}
      <PhaseArc
        phase={phase}
        moonDiameter={moonDiameter}
      />
    </div>
  );
}
