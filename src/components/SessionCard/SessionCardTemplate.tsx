'use client';

import { forwardRef } from 'react';
import type { SessionIntelligence, MoonData } from '@/types/lunar';
import { getPhaseColour } from '@/lib/colour-utils';

interface SessionCardTemplateProps {
  intelligence: SessionIntelligence;
  moonData: MoonData;
  format: 'square' | 'story';
}

const SessionCardTemplate = forwardRef<HTMLDivElement, SessionCardTemplateProps>(
  function SessionCardTemplate({ intelligence, moonData, format }, ref) {
    const phaseColour = intelligence.phase.colour || getPhaseColour(moonData.phase);
    const isStory = format === 'story';
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    const topFreqs = intelligence.frequencies.slice(0, 3);
    const moonrise = moonData.moonrise
      ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(moonData.moonrise)
      : '--:--';

    const today = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#05050F',
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          color: '#F0EEF8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isStory ? 'center' : 'center',
          alignItems: 'center',
          padding: isStory ? '120px 80px' : '80px 80px',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient bg */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at 50% 40%, ${phaseColour}15 0%, transparent 60%)`,
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
          {/* Date */}
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '22px',
              color: '#C8C4DC',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: isStory ? '60px' : '40px',
              opacity: 0.6,
            }}
          >
            {today}
          </p>

          {/* Phase name */}
          <h1
            style={{
              fontSize: isStory ? '96px' : '80px',
              fontWeight: 300,
              letterSpacing: '0.04em',
              margin: '0 0 16px',
              color: '#F0EEF8',
            }}
          >
            {moonData.phaseDisplayName}
          </h1>

          {/* Zodiac + element */}
          <p
            style={{
              fontSize: '36px',
              fontStyle: 'italic',
              color: '#E8C97A',
              margin: '0 0 8px',
            }}
          >
            {intelligence.zodiac.symbol} {intelligence.zodiac.name} · {intelligence.zodiac.element}
          </p>

          {/* Illumination */}
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '24px',
              color: '#C8C4DC',
              marginBottom: isStory ? '60px' : '40px',
              opacity: 0.7,
            }}
          >
            {moonData.illuminationPercent} illuminated
          </p>

          {/* Divider */}
          <div
            style={{
              width: '120px',
              height: '1px',
              background: `linear-gradient(to right, transparent, ${phaseColour}, transparent)`,
              margin: `0 auto ${isStory ? '60px' : '40px'}`,
            }}
          />

          {/* Session guidance one-liner */}
          <p
            style={{
              fontSize: '28px',
              fontStyle: 'italic',
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: `0 auto ${isStory ? '60px' : '40px'}`,
              color: '#F0EEF8',
              opacity: 0.85,
            }}
          >
            &ldquo;{intelligence.quote}&rdquo;
          </p>

          {/* Frequencies */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              marginBottom: isStory ? '40px' : '30px',
            }}
          >
            {topFreqs.map((f) => (
              <div key={f.hz} style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '28px',
                    color: phaseColour,
                    margin: '0 0 4px',
                  }}
                >
                  {f.hz} Hz
                </p>
                <p
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '14px',
                    color: '#C8C4DC',
                    opacity: 0.5,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {f.type}
                </p>
              </div>
            ))}
          </div>

          {/* Moonrise */}
          <p
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '18px',
              color: '#C8C4DC',
              opacity: 0.5,
              marginBottom: isStory ? '80px' : '40px',
            }}
          >
            Moonrise {moonrise}
          </p>
        </div>

        {/* Branding */}
        <p
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '60px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '14px',
            color: '#C8C4DC',
            opacity: 0.3,
            letterSpacing: '0.1em',
            margin: 0,
          }}
        >
          Lunar Practitioner &middot; NestorLab
        </p>
      </div>
    );
  }
);

export default SessionCardTemplate;
