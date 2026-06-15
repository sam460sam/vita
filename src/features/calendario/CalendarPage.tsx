import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, CheckSquare, Dumbbell, BookHeart } from 'lucide-react';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  addDays,
} from 'date-fns';
import { activeDfnLocale } from '@/lib/format';
import { db } from '@/data/db';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Segmented, IconButton, EmptyState } from '@/ui';
import { cn } from '@/lib/cn';
import { getSport } from '@/features/attivita/sports';
import { moodMeta } from '@/features/diario/mood';
import { useT } from '@/i18n';

type DayItems = { tasks: number; workouts: number; journal: boolean };

export function CalendarPage() {
  const t = useT();
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const journal = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const [cursor, setCursor] = useState(new Date());
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [selected, setSelected] = useState(new Date());

  const days = useMemo(() => {
    if (mode === 'week') {
      const start = startOfWeek(cursor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const out: Date[] = [];
    let d = start;
    while (d <= end) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, [cursor, mode]);

  function itemsFor(d: Date): DayItems {
    const iso = format(d, 'yyyy-MM-dd');
    return {
      tasks: (tasks ?? []).filter((t) => t.dueDate === iso && t.status !== 'done').length,
      workouts: (workouts ?? []).filter((w) => isSameDay(new Date(w.startedAt), d)).length,
      journal: (journal ?? []).some((j) => j.date === iso),
    };
  }

  const selISO = format(selected, 'yyyy-MM-dd');
  const selTasks = (tasks ?? []).filter((t) => t.dueDate === selISO);
  const selWorkouts = (workouts ?? []).filter((w) => isSameDay(new Date(w.startedAt), selected));
  const selJournal = (journal ?? []).filter((j) => j.date === selISO);
  const empty = selTasks.length === 0 && selWorkouts.length === 0 && selJournal.length === 0;

  const weekLabels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  return (
    <>
      <PageHeader title={t('calendar.title')} back="/altro" />
      <Screen>
        <Card heroAccent="var(--c-project)" className="mb-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <IconButton label={t('common.previous')} onClick={() => setCursor((c) => (mode === 'month' ? addMonths(c, -1) : addDays(c, -7)))}>
              <ChevronLeft size={18} />
            </IconButton>
            <span className="text-[15px] font-semibold text-ink capitalize">{format(cursor, 'MMMM yyyy', { locale: activeDfnLocale() })}</span>
            <IconButton label={t('common.next')} onClick={() => setCursor((c) => (mode === 'month' ? addMonths(c, 1) : addDays(c, 7)))}>
              <ChevronRight size={18} />
            </IconButton>
          </div>

          <Segmented
            className="w-full mb-3"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'month', label: t('calendar.month') },
              { value: 'week', label: t('calendar.week') },
            ]}
          />

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekLabels.map((w, i) => (
              <div key={i} className="text-center text-[11px] font-semibold text-ink-3">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const items = itemsFor(d);
              const inMonth = mode === 'week' || isSameMonth(d, cursor);
              const isSel = isSameDay(d, selected);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelected(d)}
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-colors',
                    !inMonth && 'opacity-30',
                    isSel ? 'bg-ink text-app' : isToday(d) ? 'bg-section ring-1 ring-ink/15' : 'hover:bg-section',
                  )}
                >
                  <span className={cn('text-[13px] tnum font-medium', isSel ? 'text-app' : 'text-ink')}>{format(d, 'd')}</span>
                  <span className="flex gap-0.5 h-1.5">
                    {items.tasks > 0 && <Dot color="var(--c-project)" on={isSel} />}
                    {items.workouts > 0 && <Dot color="var(--c-activity)" on={isSel} />}
                    {items.journal && <Dot color="var(--c-journal)" on={isSel} />}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="text-[15px] font-semibold text-ink capitalize mb-3">{format(selected, 'EEEE d MMMM', { locale: activeDfnLocale() })}</div>
          {empty ? (
            <EmptyState title={t('calendar.empty.title')} description={t('calendar.empty.desc')} />
          ) : (
            <div className="space-y-3">
              {selTasks.map((task) => (
                <Row key={task.id} icon={<CheckSquare size={16} />} color="var(--c-project)" title={task.title} muted={task.status === 'done'} sub={t('calendar.item.task')} />
              ))}
              {selWorkouts.map((w) => (
                <Row key={w.id} icon={<Dumbbell size={16} />} color="var(--c-activity)" title={getSport(w.sportId).name} sub={`${Math.round(w.durationSec / 60)} min · ${w.activeKcal} kcal`} />
              ))}
              {selJournal.map((j) => (
                <Row key={j.id} icon={<BookHeart size={16} />} color="var(--c-journal)" title={`${moodMeta(j.mood).emoji} ${j.text || moodMeta(j.mood).label}`} sub={t('calendar.item.journal')} />
              ))}
            </div>
          )}
        </Card>
      </Screen>
    </>
  );
}

function Dot({ color, on }: { color: string; on: boolean }) {
  return <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? 'var(--c-app)' : color }} />;
}

function Row({ icon, color, title, sub, muted }: { icon: React.ReactNode; color: string; title: string; sub: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}1a`, color }}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className={cn('text-[15px] truncate', muted ? 'text-ink-3 line-through' : 'text-ink')}>{title}</div>
        <div className="text-[12px] text-ink-2">{sub}</div>
      </div>
    </div>
  );
}
