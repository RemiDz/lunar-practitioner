'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EASE_LUNAR,
  SPLASH_MIN_DURATION,
  DURATION_SPLASH_EXIT,
  DURATION_CRESCENT_DRAW,
} from '@/lib/motion-constants';

interface SplashScreenProps {
  isReady: boolean;
  onDismiss: () => void;
}

export default function SplashScreen({ isReady, onDismiss }: SplashScreenProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && minTimeElapsed) {
      setVisible(false);
    }
  }, [isReady, minTimeElapsed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] bg-void-black flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: {
              duration: DURATION_SPLASH_EXIT,
              ease: [...EASE_LUNAR],
            },
          }}
          onAnimationComplete={(def) => {
            // Only call onDismiss when the exit animation completes
            if (typeof def === 'object' && 'opacity' in def && def.opacity === 0) {
              onDismiss();
            }
          }}
        >
          {/* Title */}
          <motion.h1
            className="font-display text-3xl tracking-[0.15em] text-selenite-white font-light mb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0, ease: [...EASE_LUNAR] }}
          >
            Lunar Practitioner
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="font-mono text-xs text-moonsilver/50 tracking-wider mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Moon Intelligence for Sound Healing
          </motion.p>

          {/* Crescent SVG with path draw */}
          <div className="relative w-20 h-20">
            <motion.svg
              viewBox="0 0 80 80"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M58 40c0 15.464-12.536 28-28 28-8.82 0-16.68-4.08-21.81-10.45C12.28 61.19 17.88 63 23.87 63c15.464 0 28-12.536 28-28S39.334 7 23.87 7c-5.99 0-11.59 1.81-15.68 5.45C13.32 6.08 21.18 2 30 2c15.464 0 28 12.536 28 28z"
                stroke="#C8C4DC"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0.6 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: {
                    duration: DURATION_CRESCENT_DRAW,
                    delay: 0.4,
                    ease: [...EASE_LUNAR],
                  },
                  opacity: { duration: 0.3, delay: 0.4 },
                }}
              />
            </motion.svg>

            {/* Radial glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(200,196,220,0.3) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
