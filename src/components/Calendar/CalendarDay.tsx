'use client';

import type { CalendarDayData } from '@/hooks/useCalendarData';
import type { ZodiacSignName } from '@/types/lunar';
import { ZODIAC_CONFIGS } from '@/data/zodiac';

interface CalendarDayProps {
  day: CalendarDayData;
  onClick: () => void;
}

const PHASE_EMOJIS: Record<string, string> = {
  NEW_MOON: '\u{1F311}',
  WAXING_CRESCENT: '\u{1F312}',
  FIRST_QUARTER: '\u{1F313}',
  WAXING_GIBBOUS: '\u{1F314}',
  FULL_MOON: '\u{1F315}',
  WANING_GIBBOUS: '\u{1F316}',
  LAST_QUARTER: '\u{1F317}',
  WANING_CRESCENT: '\u{1F318}',
};

export default function CalendarDay({ day, onClick }: CalendarDayProps) {
  const emoji = PHASE_EMOJIS[day.moonData.phaseName] || '\u{1F315}';
  const zodiacSymbol = day.zodiacPosition
    ? ZODIAC_CONFIGS[day.zodiacPosition.signName as ZodiacSignName]?.symbol || ''
    : '';

  const dayNum = day.date.getDate();
  const monthShort = day.date.toLocaleDateString('en-GB', { month: 'short' });

  // Highlight ring classes
  let ringClass = '';
  if (day.isSupermoon && day.isFullMoon) {
    ringClass = 'ring-2 ring-lunar-gold shadow-[0_0_12px_rgba(232,201,122,0.35)]';
  } else if (day.isFullMoon) {
    ringClass = 'ring-2 ring-lunar-gold/60';
  } else if (day.isNewMoon) {
    ringClass = 'ring-2 ring-indigo-deep/80';
  }

  const todayClass = day.isToday ? 'border-lunar-gold/40' : 'border-moonsilver/10';

  return (
    <div>
      <button
        onClick={onClick}
        className={`w-full flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl border transition-colors hover:bg-moonsilver/5 cursor-pointer ${todayClass} ${ringClass}`}
      >
        {/* Date */}
        <span className="font-mono text-[10px] text-moonsilver/50">
          {dayNum} {monthShort}
        </span>

        {/* Phase emoji */}
        <span className="text-2xl leading-none">{emoji}</span>

        {/* Illumination */}
        <span className="font-mono text-[10px] text-moonsilver/60">
          {day.moonData.illuminationPercent}
        </span>

        {/* Zodiac symbol */}
        <span className="text-xs text-moonsilver/40">{zodiacSymbol}</span>
      </button>
    </div>
  );
}
