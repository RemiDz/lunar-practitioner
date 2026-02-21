'use client';

import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import type { SessionIntelligence, MoonData } from '@/types/lunar';
import SessionCardTemplate from './SessionCardTemplate';

interface SessionCardGeneratorProps {
  intelligence: SessionIntelligence;
  moonData: MoonData;
}

type CardFormat = 'square' | 'story';

export default function SessionCardGenerator({
  intelligence,
  moonData,
}: SessionCardGeneratorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<CardFormat>('square');
  const cardRef = useRef<HTMLDivElement>(null);

  const generateCard = useCallback(
    async (format: CardFormat) => {
      setActiveFormat(format);
      setShowPicker(false);
      setGenerating(true);

      // Wait a frame for the template to render with the correct format
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      try {
        if (!cardRef.current) return;

        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: '#05050F',
          useCORS: true,
          logging: false,
        });

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `lunar-session-${dateStr}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      } catch (err) {
        console.error('Failed to generate session card:', err);
      } finally {
        setGenerating(false);
      }
    },
    []
  );

  return (
    <>
      {/* Off-screen template for capture */}
      <SessionCardTemplate
        ref={cardRef}
        intelligence={intelligence}
        moonData={moonData}
        format={activeFormat}
      />

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Format picker */}
        {showPicker && (
          <div className="absolute bottom-14 right-0 flex flex-col gap-2 mb-2">
            <button
              onClick={() => generateCard('square')}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-[#0D0D25]/95 backdrop-blur-md border border-moonsilver/15 text-selenite-white hover:border-lunar-gold/30 transition-colors whitespace-nowrap"
            >
              Square (1080&times;1080)
            </button>
            <button
              onClick={() => generateCard('story')}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-[#0D0D25]/95 backdrop-blur-md border border-moonsilver/15 text-selenite-white hover:border-lunar-gold/30 transition-colors whitespace-nowrap"
            >
              Story (1080&times;1920)
            </button>
          </div>
        )}

        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={generating}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-mono text-xs backdrop-blur-md border transition-all ${
            generating
              ? 'bg-[#0D0D25]/80 border-moonsilver/10 text-moonsilver/40 cursor-wait'
              : 'bg-[#0D0D25]/90 border-moonsilver/15 text-selenite-white hover:border-lunar-gold/30 hover:bg-[#0D0D25]/95'
          }`}
          aria-label="Share session card"
        >
          {generating ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            <>
              {/* Share icon */}
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                />
              </svg>
              Share
            </>
          )}
        </button>
      </div>
    </>
  );
}
