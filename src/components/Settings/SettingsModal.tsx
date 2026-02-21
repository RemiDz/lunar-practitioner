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

  // CSS-based enter/exit animation
  useEffect(() => {
    if (isOpen) {
      // Small delay so the DOM mounts first, then CSS transition triggers
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          background: 'rgba(6, 6, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal panel — glass morphism matching main cards */}
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(240,238,248,0.04) 0%, rgba(200,196,220,0.07) 50%, rgba(240,238,248,0.03) 100%)',
          backdropFilter: 'blur(24px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
          border: '1px solid rgba(200,196,220,0.1)',
          boxShadow: '0 0 0 1px rgba(200,196,220,0.05) inset, 0 24px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.35s ease-out, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top edge highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(240,238,248,0.2), transparent)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-selenite-white tracking-wide">Settings</h2>
            <button
              onClick={onClose}
              className="text-moonsilver/50 hover:text-selenite-white transition-colors p-1"
              aria-label="Close settings"
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
                  className="w-full rounded-lg px-3 py-2 text-sm font-mono text-selenite-white placeholder:text-moonsilver/30 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(200,196,220,0.05)',
                    border: '1px solid rgba(200,196,220,0.1)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(232,201,122,0.3)';
                    e.target.style.boxShadow = '0 0 12px rgba(232,201,122,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(200,196,220,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
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
                  className="w-full rounded-lg px-3 py-2 text-sm font-mono text-selenite-white placeholder:text-moonsilver/30 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(200,196,220,0.05)',
                    border: '1px solid rgba(200,196,220,0.1)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(232,201,122,0.3)';
                    e.target.style.boxShadow = '0 0 12px rgba(232,201,122,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(200,196,220,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLocationSave}
                className="px-4 py-1.5 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: 'rgba(232,201,122,0.1)',
                  border: '1px solid rgba(232,201,122,0.2)',
                  color: '#E8C97A',
                }}
              >
                Apply
              </button>
              <button
                onClick={handleUseDevice}
                className="px-4 py-1.5 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: 'rgba(200,196,220,0.05)',
                  border: '1px solid rgba(200,196,220,0.1)',
                  color: 'rgba(200,196,220,0.6)',
                }}
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

          {/* Section divider */}
          <div
            className="mb-8"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(200,196,220,0.08), transparent)',
            }}
          />

          {/* ── Audio Section ── */}
          <div className="mb-8">
            <p className="font-mono text-[10px] text-moonsilver/50 uppercase tracking-[0.2em] mb-3">
              Audio
            </p>

            <div className="space-y-4">
              {/* Enable/disable toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-moonsilver/70">Enable audio</span>
                <button
                  onClick={() => onAudioEnabledChange?.(!audioEnabled)}
                  className="relative transition-all"
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: audioEnabled ? 'rgba(232,201,122,0.2)' : 'rgba(200,196,220,0.1)',
                    border: `1px solid ${audioEnabled ? 'rgba(232,201,122,0.3)' : 'rgba(200,196,220,0.15)'}`,
                  }}
                >
                  <span
                    className="absolute top-[2px] transition-all"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: audioEnabled ? '#E8C97A' : 'rgba(200,196,220,0.5)',
                      left: audioEnabled ? 22 : 2,
                      transition: 'left 0.3s ease, background 0.3s ease',
                    }}
                  />
                </button>
              </div>

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

          {/* Section divider */}
          <div
            className="mb-8"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(200,196,220,0.08), transparent)',
            }}
          />

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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs"
                    style={{
                      background: checked ? 'rgba(232,201,122,0.08)' : 'rgba(200,196,220,0.03)',
                      border: `1px solid ${checked ? 'rgba(232,201,122,0.15)' : 'rgba(200,196,220,0.06)'}`,
                      color: checked ? '#F0EEF8' : 'rgba(200,196,220,0.55)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleInstrument(instrument)}
                      className="sr-only"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: checked ? 'rgba(232,201,122,0.25)' : 'transparent',
                        border: `1px solid ${checked ? 'rgba(232,201,122,0.4)' : 'rgba(200,196,220,0.2)'}`,
                      }}
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
    </div>
  );
}
