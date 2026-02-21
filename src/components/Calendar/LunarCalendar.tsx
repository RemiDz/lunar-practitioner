'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  // Get the day-of-week offset for the first day (0=Mon, 6=Sun)
  const firstDayOffset = days.length > 0
    ? ((days[0].date.getDay() + 6) % 7) // Convert Sun=0 to Mon=0
    : 0;

  return (
    <div>
      {/* Section heading */}
      <h2 className="font-display text-2xl md:text-3xl text-selenite-white font-light text-center mb-8">
        Lunar Calendar
      </h2>

      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>
      )}

      {/* Day detail modal */}
      <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
    </div>
  );
}

function CalendarSkeleton() {
  return (
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
  );
}
