import { useState } from 'react';
import { startOfWeek, addDays, subDays, format, parseISO, isAfter, startOfDay } from 'date-fns';
import { Icon } from '@/ui';
import { platform } from '@/platform/platform';
import { toggleHabitLog } from '@/data/repo';
import { isScheduled, isDone } from './logic';
import { habitDisplayName } from './recommended';
import { useT } from '@/i18n';
import { weekdayInitials } from '@/lib/format';
import type { Habit, HabitLog } from '@/data/types';

/** A weekly completion grid (rows = habits, columns = Mon–Sun): filled in the
 *  habit's color = done, hollow ring = scheduled-not-done, today highlighted.
 *  Tapping a cell toggles that day (past + today only). Also a 30-day heat-map. */
export function HabitWeeklyChart({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  const t = useT();
  const DOW = weekdayInitials(); // Monday-first, localized
  const [view, setView] = useState<'week' | 'month'>('week');
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
  const monthDays = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'));
  const future = (iso: string) => isAfter(startOfDay(parseISO(iso)), startOfDay(new Date()));

  function cellTap(h: Habit, iso: string) {
    if (future(iso) || !isScheduled(h, iso)) return;
    platform.haptic();
    void toggleHabitLog(h.id, iso);
  }

  if (habits.length === 0) return null;
  const NAME_W = 104;

  return (
    <div className="rounded-card bg-card shadow-card p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14.5px] font-bold text-ink">{t('habits.weekChart')}</h3>
        <div className="flex bg-section rounded-full p-0.5 text-[12px] font-semibold">
          <button onClick={() => setView('week')} className="px-2.5 py-1 rounded-full transition-colors" style={view === 'week' ? { background: 'var(--c-primary)', color: 'var(--c-on-primary)' } : { color: 'var(--c-ink-3)' }}>{t('progress.period.week')}</button>
          <button onClick={() => setView('month')} className="px-2.5 py-1 rounded-full transition-colors" style={view === 'month' ? { background: 'var(--c-primary)', color: 'var(--c-on-primary)' } : { color: 'var(--c-ink-3)' }}>{t('habits.30days')}</button>
        </div>
      </div>

      {view === 'week' ? (
        <>
          <div className="flex items-center gap-1 mb-1.5" style={{ paddingLeft: NAME_W }}>
            {weekDays.map((iso, i) => (
              <span key={iso} className="flex-1 text-center text-[10.5px] font-bold" style={{ color: iso === todayIso ? 'var(--c-habit)' : 'var(--c-ink-3)' }}>{DOW[i]}</span>
            ))}
          </div>
          <div className="space-y-1.5">
            {habits.map((h) => (
              <div key={h.id} className="flex items-center gap-1">
                <span className="flex items-center gap-1.5 min-w-0" style={{ width: NAME_W }}>
                  <span className="flex-shrink-0" style={{ color: h.color }}><Icon name={h.icon} size={15} strokeWidth={2.5} /></span>
                  <span className="text-[12.5px] text-ink truncate">{habitDisplayName(h, t)}</span>
                </span>
                {weekDays.map((iso) => {
                  const sched = isScheduled(h, iso);
                  const done = isDone(logs, h.id, iso);
                  const fut = future(iso);
                  return (
                    <button key={iso} onClick={() => cellTap(h, iso)} disabled={fut || !sched} aria-label={iso} className="flex-1 flex items-center justify-center py-0.5">
                      <span className="h-6 w-6 rounded-full flex items-center justify-center" style={{
                        background: done ? h.color : 'transparent',
                        opacity: sched ? 1 : 0.4,
                        boxShadow: iso === todayIso
                          ? `0 0 0 2px color-mix(in srgb, ${h.color} 80%, transparent)`
                          : (sched && !done ? `inset 0 0 0 1.5px color-mix(in srgb, ${h.color} 40%, transparent)` : 'none'),
                      }}>
                        {done && <span className="text-[11px] text-white">✓</span>}
                        {!sched && <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--c-line)' }} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-1.5">
          {habits.map((h) => (
            <div key={h.id} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 min-w-0" style={{ width: NAME_W }}>
                <span className="flex-shrink-0" style={{ color: h.color }}><Icon name={h.icon} size={15} strokeWidth={2.5} /></span>
                <span className="text-[12.5px] text-ink truncate">{habitDisplayName(h, t)}</span>
              </span>
              <span className="flex-1 flex items-center gap-[2px]">
                {monthDays.map((iso) => {
                  const sched = isScheduled(h, iso);
                  const done = isDone(logs, h.id, iso);
                  return <span key={iso} className="flex-1 h-4 rounded-[2px]" style={{ background: done ? h.color : (sched ? `color-mix(in srgb, ${h.color} 20%, var(--c-section))` : 'var(--c-section)'), boxShadow: iso === todayIso ? `0 0 0 1.5px ${h.color}` : 'none' }} />;
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
