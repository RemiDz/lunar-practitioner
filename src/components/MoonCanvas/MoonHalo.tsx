'use client';

import { motion } from 'framer-motion';
import { getHaloColour, getHaloIntensity } from '@/lib/colour-utils';
import {
  DURATION_GLOW_PULSE,
  HALO_BASE_RADIUS,
  HALO_SUPERMOON_BOOST,
} from '@/lib/motion-constants';

interface MoonHaloProps {
  phase: number;
  illumination: number;
  moonDiameter: number;
  isSupermoon: boolean;
}

export default function MoonHalo({
  phase,
  illumination,
  moonDiameter,
  isSupermoon,
}: MoonHaloProps) {
  const colour = getHaloColour(phase);
  const intensity = getHaloIntensity(illumination);
  const radiusMultiplier = HALO_BASE_RADIUS * (isSupermoon ? HALO_SUPERMOON_BOOST : 1);
  const haloDiameter = moonDiameter * radiusMultiplier;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        zIndex: 2,
        left: '50%',
        top: '45%',
        width: haloDiameter,
        height: haloDiameter,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colour}${Math.round(intensity * 40).toString(16).padStart(2, '0')} 0%, ${colour}${Math.round(intensity * 15).toString(16).padStart(2, '0')} 40%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.04, 1],
        opacity: [intensity * 0.9, intensity, intensity * 0.9],
      }}
      transition={{
        duration: DURATION_GLOW_PULSE,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
