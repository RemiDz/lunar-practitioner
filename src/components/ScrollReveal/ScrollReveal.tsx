'use client';

import { motion } from 'framer-motion';
import { DURATION_SCROLL_REVEAL, SCROLL_REVEAL_OFFSET, EASE_LUNAR } from '@/lib/motion-constants';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'none';
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
}: ScrollRevealProps) {
  const y = direction === 'up' ? SCROLL_REVEAL_OFFSET : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: DURATION_SCROLL_REVEAL,
        ease: [...EASE_LUNAR],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
