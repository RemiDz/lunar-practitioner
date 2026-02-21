'use client';

import { motion } from 'framer-motion';
import { DURATION_CARD_ENTER } from '@/lib/motion-constants';
import type { Variants } from 'framer-motion';

interface GlassCardProps {
  label: string;
  accentColour?: string;
  fullWidth?: boolean;
  skeleton?: boolean;
  children?: React.ReactNode;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_CARD_ENTER,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function GlassCard({
  label,
  accentColour,
  fullWidth,
  skeleton,
  children,
}: GlassCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      className={`
        relative overflow-hidden
        bg-[#0D0D25]/90 backdrop-blur-md
        border border-moonsilver/10 rounded-xl
        p-5 md:p-6
        ${fullWidth ? 'md:col-span-2' : ''}
      `}
    >
      {/* Accent top border */}
      {accentColour && (
        <div
          className="absolute top-0 inset-x-0 h-px transition-colors duration-1000 ease-in-out"
          style={{ backgroundColor: accentColour }}
        />
      )}

      {/* Card label */}
      <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-4">
        {label}
      </p>

      {/* Content or skeleton */}
      {skeleton ? (
        <div className="space-y-3">
          <div className="h-5 w-3/4 bg-moonsilver/10 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-moonsilver/10 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-moonsilver/10 rounded animate-pulse" />
          <div className="h-3 w-1/3 bg-moonsilver/10 rounded animate-pulse" />
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}
