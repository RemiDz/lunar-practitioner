'use client';

import { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { useCalendarData } from '@/hooks/useCalendarData';
import type { CalendarDayData } from '@/hooks/useCalendarData';
import CalendarDay from './CalendarDay';
import DayDetailModal from './DayDetailModal';

interface LunarCalendarProps {
  latitude: number;
  longitude: number;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function LunarCalendar({ latitude, longitude }: LunarCalendarProps) {
  const { days, isLoading } = useCalendarData(latitude, longitude);
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Get the day-of-week offset for the first day (0=Mon, 6=Sun)
  const firstDayOffset = days.length > 0
    ? ((days[0].date.getDay() + 6) % 7) // Convert Sun=0 to Mon=0
    : 0;

  const handleSaveImage = useCallback(async () => {
    if (!calendarRef.current) return;

    try {
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#06061A',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (_clonedDoc: Document, element: HTMLElement) => {
          element.style.background = '#06061A';
          element.style.padding = '20px';
          element.style.borderRadius = '0';

          const glassCards = element.querySelectorAll('.glass-card, [class*="glass"]');
          glassCards.forEach((card) => {
            const el = card as HTMLElement;
            el.style.background = 'rgba(15, 15, 40, 0.95)';
            el.style.backdropFilter = 'none';
            el.style.setProperty('-webkit-backdrop-filter', 'none');
          });
        },
      });

      const dateStr = new Date().toISOString().split('T')[0];
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        const dataUrl = canvas.toDataURL('image/png');
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`<img src="${dataUrl}" style="width:100%;"/>`);
          newTab.document.title = 'Lunar Calendar \u2014 Long press to save';
        }
      } else {
        const link = document.createElement('a');
        link.download = `lunar-calendar-${dateStr}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (err) {
      console.error('Failed to save calendar image:', err);
    }
  }, []);

  return (
    <div>
      {/* Capturable region: title + grid + legend */}
      <div ref={calendarRef}>
        {/* Section heading */}
        <h2 className="font-display text-2xl md:text-3xl text-selenite-white font-light text-center mb-8">
          Lunar Calendar
        </h2>

        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <div className="glass-card p-4 md:p-6">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 overflow-x-auto">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center font-mono text-[10px] text-moonsilver/40 uppercase tracking-wider py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {days.map((day) => (
                <CalendarDay
                  key={day.date.toISOString()}
                  day={day}
                  onClick={() => setSelectedDay(day)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-[10px] font-mono text-moonsilver/40">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-indigo-deep/80 inline-block" />
                New Moon
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-lunar-gold/60 inline-block" />
                Full Moon
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-lunar-gold shadow-[0_0_6px_rgba(232,201,122,0.3)] inline-block" />
                Supermoon
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Save button — outside the ref so it doesn't appear in the image */}
      {!isLoading && days.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveImage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-sm transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(232,201,122,0.12), rgba(232,201,122,0.06))',
              border: '1px solid rgba(232,201,122,0.2)',
              color: '#E8C97A',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Save
          </button>
        </div>
      )}

      {/* Day detail modal */}
      <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="glass-card p-4 md:p-6">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl border border-moonsilver/5 animate-pulse"
          >
            <div className="h-2 w-8 bg-moonsilver/10 rounded" />
            <div className="h-6 w-6 bg-moonsilver/10 rounded-full" />
            <div className="h-2 w-6 bg-moonsilver/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
