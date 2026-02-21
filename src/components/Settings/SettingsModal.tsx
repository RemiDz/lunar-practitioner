'use client';

import { useState, useEffect } from 'react';
import type { GeoLocation } from '@/types/lunar';

const ALL_INSTRUMENTS = [
  'Gong',
  'Monochord',
  'Crystal Singing Bowls',
  'Didgeridoo',
  'Drums',
  'Bells',
  'Rattles',
  'Handpan',
  'Chimes',
  'Tuning Forks',
  'Ocean Drum',
  'Shruti Box',
  'Voice',
] as const;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationOverride: GeoLocation | null;
  onLocationChange: (loc: GeoLocation | null) => void;
  userInstruments: string[];
  onInstrumentsChange: (instruments: string[]) => void;
  audioVolume?: number;
  onAudioVolumeChange?: (v: number) => void;
  audioEnabled?: boolean;
  onAudioEnabledChange?: (enabled: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  locationOverride,
  onLocationChange,
  userInstruments,
  onInstrumentsChange,
  audioVolume = 0.3,
  onAudioVolumeChange,
  audioEnabled = true,
  onAudioEnabledChange,
}: SettingsModalProps) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [visible, setVisible] = useState(false);

  // Sync local state with prop
  useEffect(() => {
    if (locationOverride) {
      setLat(String(locationOverride.latitude));
      setLng(String(locationOverride.longitude));
    } else {
      setLat('');
      setLng('');
    }
  }, [locationOverride]);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleLocationSave = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
      onLocationChange({
        latitude: latNum,
        longitude: lngNum,
        source: 'manual',
        label: `${latNum.toFixed(2)}, ${lngNum.toFixed(2)}`,
      });
    }
  };

  const handleUseDevice = () => {
    onLocationChange(null);
    setLat('');
    setLng('');
  };

  const handleToggleInstrument = (instrument: string) => {
    if (userInstruments.includes(instrument)) {
      onInstrumentsChange(userInstruments.filter((i) => i !== instrument));
    } else {
      onInstrumentsChange([...userInstruments, instrument]);
    }
  };

  const handleSelectAll = () => {
    onInstrumentsChange([...ALL_INSTRUMENTS]);
  };

  const handleClearAll = () => {
    onInstrumentsChange([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] modal-backdrop-enter`}
        style={{
          background: 'rgba(5, 5, 15, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div
        className="glass-modal fixed inset-x-4 top-[10vh] bottom-[10vh] z-[101] mx-auto max-w-lg overflow-y-auto rounded-2xl modal-enter"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >

        {/* Modal content */}
        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl text-selenite-white tracking-wide">Settings</h2>
            <button
              onClick={handleClose}
              className="text-moonsilver/50 hover:text-selenite-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Location Section ── */}
          <div className="mb-8">
            <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-3">
              Location
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-moonsilver/60 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="51.5074"
                  className="settings-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-moonsilver/60 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="-0.1278"
                  className="settings-input w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLocationSave}
                className="px-4 py-1.5 rounded-lg text-xs font-mono bg-lunar-gold/15 text-lunar-gold border border-lunar-gold/20 hover:bg-lunar-gold/25 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleUseDevice}
                className="px-4 py-1.5 rounded-lg text-xs font-mono bg-moonsilver/10 text-moonsilver/70 border border-moonsilver/15 hover:bg-moonsilver/20 transition-colors"
              >
                Use device location
              </button>
            </div>

            {locationOverride && (
              <p className="text-xs text-lunar-gold/60 mt-2 font-mono">
                Using manual: {locationOverride.label || `${locationOverride.latitude}, ${locationOverride.longitude}`}
              </p>
            )}
          </div>

          <div className="settings-divider" />

          {/* ── Audio Section ── */}
          <div className="mb-8">
            <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-3">
              Audio
            </p>

            <div className="space-y-4">
              {/* Enable/disable toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-moonsilver/70">Enable audio</span>
                <button
                  onClick={() => onAudioEnabledChange?.(!audioEnabled)}
                  className={`settings-toggle ${audioEnabled ? 'active' : ''}`}
                >
                  <span className="knob" />
                </button>
              </label>

              {/* Volume slider */}
              <div>
                <label className="block text-xs text-moonsilver/60 mb-2">
                  Volume: {Math.round(audioVolume * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audioVolume}
                  onChange={(e) => onAudioVolumeChange?.(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-lunar-gold cursor-pointer"
                />
              </div>

              <p className="text-[10px] text-moonsilver/30">
                Ambient drone at 210.42 Hz (lunar planetary tone) and frequency previews.
              </p>
            </div>
          </div>

          <div className="settings-divider" />

          {/* ── Instruments Section ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em]">
                My Instruments
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-[10px] font-mono text-moonsilver/40 hover:text-moonsilver/70 transition-colors"
                >
                  All
                </button>
                <span className="text-moonsilver/20">|</span>
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-mono text-moonsilver/40 hover:text-moonsilver/70 transition-colors"
                >
                  None
                </button>
              </div>
            </div>

            <p className="text-xs text-moonsilver/40 mb-3">
              Select instruments you own to highlight personalised recommendations.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {ALL_INSTRUMENTS.map((instrument) => {
                const checked = userInstruments.includes(instrument);
                return (
                  <label
                    key={instrument}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      checked
                        ? 'bg-lunar-gold/10 border border-lunar-gold/20 text-selenite-white'
                        : 'bg-moonsilver/5 border border-moonsilver/10 text-moonsilver/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleInstrument(instrument)}
                      className="sr-only"
                    />
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                        checked
                          ? 'bg-lunar-gold/30 border-lunar-gold/50'
                          : 'border-moonsilver/30'
                      }`}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-lunar-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {instrument}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
