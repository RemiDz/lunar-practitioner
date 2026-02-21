'use client';

interface AudioControlsProps {
  isInitialised: boolean;
  isDroneActive: boolean;
  volume: number;
  onInit: () => void;
  onToggleDrone: () => void;
  onVolumeChange: (v: number) => void;
}

export default function AudioControls({
  isInitialised,
  isDroneActive,
  volume,
  onInit,
  onToggleDrone,
  onVolumeChange,
}: AudioControlsProps) {
  const handleSpeakerClick = () => {
    if (!isInitialised) {
      onInit();
    } else {
      // Toggle mute
      onVolumeChange(volume > 0 ? 0 : 0.3);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Drone toggle pill */}
      {isInitialised && (
        <button
          onClick={onToggleDrone}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all ${
            isDroneActive
              ? 'bg-lunar-gold/15 border border-lunar-gold/30 text-lunar-gold shadow-[0_0_8px_rgba(232,201,122,0.15)]'
              : 'border border-moonsilver/15 text-moonsilver/50 hover:text-moonsilver/70'
          }`}
        >
          Drone
        </button>
      )}

      {/* Volume slider (hidden on mobile) */}
      {isInitialised && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="hidden sm:block w-16 h-1 accent-lunar-gold opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Volume"
        />
      )}

      {/* Speaker icon */}
      <button
        onClick={handleSpeakerClick}
        className="text-moonsilver/50 hover:text-selenite-white transition-colors p-1"
        aria-label={isInitialised ? 'Toggle mute' : 'Enable audio'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {volume > 0 || !isInitialised ? (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l-4.5 3.75H3v7.5h3.75l4.5 3.75V4.5z" />
            </>
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l-4.5 3.75H3v7.5h3.75l4.5 3.75V4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75l4.5 4.5m0-4.5l-4.5 4.5" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
