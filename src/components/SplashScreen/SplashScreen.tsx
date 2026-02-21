'use client';

import { useState, useEffect } from 'react';

interface SplashScreenProps {
  isReady: boolean;
  onDismiss: () => void;
}

export default function SplashScreen({ isReady, onDismiss }: SplashScreenProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [fading, setFading] = useState(false);

  // Minimum display time
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // When ready + min time elapsed, fade out then unmount
  useEffect(() => {
    if (isReady && minTimeElapsed && !fading) {
      setFading(true);
      const timer = setTimeout(onDismiss, 900);
      return () => clearTimeout(timer);
    }
  }, [isReady, minTimeElapsed, fading, onDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#05050F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.8s ease-out',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <h1
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.875rem',
          letterSpacing: '0.15em',
          color: '#F0EEF8',
          fontWeight: 300,
          marginBottom: '0.5rem',
        }}
      >
        Lunar Practitioner
      </h1>
      <p
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem',
          color: 'rgba(200,196,220,0.5)',
          letterSpacing: '0.05em',
          marginBottom: '2.5rem',
        }}
      >
        Moon Intelligence for Sound Healing
      </p>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M58 40c0 15.464-12.536 28-28 28-8.82 0-16.68-4.08-21.81-10.45C12.28 61.19 17.88 63 23.87 63c15.464 0 28-12.536 28-28S39.334 7 23.87 7c-5.99 0-11.59 1.81-15.68 5.45C13.32 6.08 21.18 2 30 2c15.464 0 28 12.536 28 28z"
          stroke="#C8C4DC"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
