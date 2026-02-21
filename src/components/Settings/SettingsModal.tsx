'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
}

export default function SettingsModal({
  isOpen,
  onClose,
  locationOverride,
  onLocationChange,
  userInstruments,
  onInstrumentsChange,
}: SettingsModalProps) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-void-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-[#0D0D25]/95 backdrop-blur-md border border-moonsilver/15 rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-moonsilver/50 hover:text-selenite-white transition-colors text-xl leading-none"
              aria-label="Close settings"
            >
              &times;
            </button>

            <h2 className="font-display text-2xl text-selenite-white mb-6">Settings</h2>

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
                    className="w-full bg-void-black/60 border border-moonsilver/15 rounded-lg px-3 py-2 text-sm font-mono text-selenite-white placeholder:text-moonsilver/30 focus:outline-none focus:border-lunar-gold/50 transition-colors"
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
                    className="w-full bg-void-black/60 border border-moonsilver/15 rounded-lg px-3 py-2 text-sm font-mono text-selenite-white placeholder:text-moonsilver/30 focus:outline-none focus:border-lunar-gold/50 transition-colors"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
