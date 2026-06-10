import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { cn } from '@/lib/cn';

interface DateStripProps {
  /** Selected day (ISO yyyy-MM-dd). Defaults to today. */
  selected?: string;
  /** ISO dates that should show a streak/activity micro-accent. */
  marked?: Set<string> | string[];
  onSelect?: (iso: string) => void;
  className?: string;
}

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

/** Week selector with circular date badges; current day gets an accent ring. */
export function DateStrip({ selected, marked, onSelect, className }: DateStripProps) {
  const today = new Date();
  const selDate = selected ? parseISO(selected) : today;
  const start = startOfWeek(selDate, { weekStartsOn: 1 }); // Monday
  const markedSet = marked instanceof Set ? marked : new Set(marked ?? []);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className={cn('flex items-stretch justify-between gap-1', className)}>
      {days.map((d) => {
        const key = iso(d);
        const isToday = isSameDay(d, today);
        const isSel = isSameDay(d, selDate);
        const hasMark = markedSet.has(key);
        return (
          <button
            key={key}
            onClick={() => onSelect?.(key)}
            className="flex-1 flex flex-col items-center gap-1 py-1"
            aria-label={format(d, 'EEEE d')}
            aria-pressed={isSel}
          >
            <span className="text-[11px] font-semibold text-ink-3">{format(d, 'EEEEE')}</span>
            <span
              className={cn(
                'relative h-9 w-9 flex items-center justify-center rounded-full text-[14px] font-bold tnum transition-colors',
                isSel
                  ? 'bg-accent text-on-accent'
                  : isToday
                    ? 'text-accent ring-2 ring-accent/50'
                    : 'text-ink-2',
              )}
            >
              {format(d, 'd')}
              {hasMark && !isSel && (
                <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-streak" aria-hidden />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
