'use client';

import { useState, useEffect, useRef } from 'react';
import { CONSTELLATIONS } from '@/data/constellations';
import { DURATION_CONSTELLATION_FADE } from '@/lib/motion-constants';
import type { ZodiacSignName } from '@/types/lunar';

interface ZodiacConstellationProps {
  sign: ZodiacSignName;
  containerWidth: number;
  containerHeight: number;
  moonDiameter: number;
}

export default function ZodiacConstellation({
  sign,
  containerWidth,
  containerHeight,
  moonDiameter,
}: ZodiacConstellationProps) {
  const [displaySign, setDisplaySign] = useState(sign);
  const [opacity, setOpacity] = useState(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Fade transition when sign changes
  useEffect(() => {
    if (sign !== displaySign) {
      setOpacity(0);
      timeoutRef.current = setTimeout(() => {
        setDisplaySign(sign);
        setOpacity(1);
      }, DURATION_CONSTELLATION_FADE * 1000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sign, displaySign]);

  const constellation = CONSTELLATIONS[displaySign];
  if (!constellation) return null;

  // Constellation area: 1.8x moon diameter, centred behind the moon
  const areaSize = moonDiameter * 1.8;
  const centreX = containerWidth / 2;
  const centreY = containerHeight * 0.45;
  const originX = centreX - areaSize / 2;
  const originY = centreY - areaSize / 2;

  const starColour = 'rgba(200, 196, 220, 0.35)';
  const lineColour = 'rgba(200, 196, 220, 0.12)';

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 1,
        opacity,
        transition: `opacity ${DURATION_CONSTELLATION_FADE}s ease`,
      }}
    >
      {/* Constellation lines */}
      {constellation.lines.map(([a, b], i) => {
        const sa = constellation.stars[a];
        const sb = constellation.stars[b];
        return (
          <line
            key={`line-${i}`}
            x1={originX + sa.x * areaSize}
            y1={originY + sa.y * areaSize}
            x2={originX + sb.x * areaSize}
            y2={originY + sb.y * areaSize}
            stroke={lineColour}
            strokeWidth={1}
          />
        );
      })}
      {/* Constellation stars */}
      {constellation.stars.map((star, i) => {
        const r = (5 - star.magnitude) * 0.8; // brighter = larger
        return (
          <circle
            key={`star-${i}`}
            cx={originX + star.x * areaSize}
            cy={originY + star.y * areaSize}
            r={r}
            fill={starColour}
          />
        );
      })}
    </svg>
  );
}
