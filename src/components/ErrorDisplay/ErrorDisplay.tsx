'use client';

interface ErrorDisplayProps {
  mode: 'full' | 'inline';
  error?: Error | string;
  onRetry?: () => void;
}

function CrescentSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 40c0 16.569-13.431 30-30 30C18.88 70 9.166 63.176 4.69 53.5 8.24 57.04 13.2 59 18.5 59c13.807 0 25-11.193 25-25S32.307 9 18.5 9c-5.3 0-10.26 1.96-13.81 5.5C9.166 4.824 18.88-2 30-2c16.569 0 30 13.431 30 30z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M60 40c0 16.569-13.431 30-30 30C18.88 70 9.166 63.176 4.69 53.5 8.24 57.04 13.2 59 18.5 59c13.807 0 25-11.193 25-25S32.307 9 18.5 9c-5.3 0-10.26 1.96-13.81 5.5C9.166 4.824 18.88-2 30-2c16.569 0 30 13.431 30 30z"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}

export default function ErrorDisplay({ mode, error, onRetry }: ErrorDisplayProps) {
  const errorMessage =
    error instanceof Error ? error.message : error || 'An unexpected interruption occurred.';

  if (mode === 'full') {
    return (
      <div className="fixed inset-0 z-[150] bg-void-black flex flex-col items-center justify-center px-6 text-center">
        <CrescentSVG className="w-16 h-16 text-moonsilver/30 mb-8" />

        <h1 className="font-display text-3xl md:text-4xl text-selenite-white font-light mb-4">
          Something went still.
        </h1>
        <p className="text-moonsilver/60 text-sm max-w-md mb-8 leading-relaxed">
          The lunar calculations encountered an interruption.
          Take a breath — then try again.
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-xl text-sm font-mono bg-lunar-gold/15 text-lunar-gold border border-lunar-gold/20 hover:bg-lunar-gold/25 transition-colors"
          >
            Retry
          </button>
        )}

        <details className="mt-8 max-w-md w-full text-left">
          <summary className="text-xs font-mono text-moonsilver/30 cursor-pointer hover:text-moonsilver/50 transition-colors">
            Technical details
          </summary>
          <pre className="mt-2 text-xs font-mono text-moonsilver/40 bg-void-black/50 border border-moonsilver/10 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
            {errorMessage}
          </pre>
        </details>
      </div>
    );
  }

  // Inline mode
  return (
    <div className="bg-[#0D0D25]/90 backdrop-blur-md border border-moonsilver/10 rounded-xl p-6 text-center">
      <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-3">
        Status
      </p>
      <h3 className="font-display text-xl text-selenite-white font-light mb-2">
        Calculation paused
      </h3>
      <p className="text-moonsilver/50 text-sm mb-4">
        {errorMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 rounded-lg text-xs font-mono bg-lunar-gold/15 text-lunar-gold border border-lunar-gold/20 hover:bg-lunar-gold/25 transition-colors"
        >
          Recalculate
        </button>
      )}
    </div>
  );
}
