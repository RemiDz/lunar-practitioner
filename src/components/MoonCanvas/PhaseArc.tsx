'use client';

import { getPhaseColour } from '@/lib/colour-utils';
import { PHASE_ARC_STROKE_WIDTH } from '@/lib/motion-constants';

interface PhaseArcProps {
  phase: number;
  moonDiameter: number;
}

export default function PhaseArc({ phase, moonDiameter }: PhaseArcProps) {
  const arcDiameter = moonDiameter * 1.2;
  const radius = arcDiameter / 2 - PHASE_ARC_STROKE_WIDTH;
  const circumference = 2 * Math.PI * radius;

  // Phase progress: how far through the full cycle
  const progress = phase;
  const dashLength = circumference * progress;
  const gapLength = circumference - dashLength;

  const colour = getPhaseColour(phase);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        zIndex: 4,
        left: '50%',
        top: '45%',
        width: arcDiameter,
        height: arcDiameter,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${arcDiameter} ${arcDiameter}`}
      >
        {/* Background track */}
        <circle
          cx={arcDiameter / 2}
          cy={arcDiameter / 2}
          r={radius}
          fill="none"
          stroke="rgba(200, 196, 220, 0.08)"
          strokeWidth={PHASE_ARC_STROKE_WIDTH}
        />
        {/* Progress arc */}
        <circle
          cx={arcDiameter / 2}
          cy={arcDiameter / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={PHASE_ARC_STROKE_WIDTH}
          strokeDasharray={`${dashLength} ${gapLength}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 1s ease, stroke 1s ease',
            filter: `drop-shadow(0 0 3px ${colour}40)`,
          }}
        />
      </svg>
    </div>
  );
}
