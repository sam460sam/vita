import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Dumbbell, Flame, ListTodo, Scale } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings, toggleTaskDone, toggleHabitLog } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { ActivityRings, Card, CardHeader, Checkbox, EmptyState, StatTile } from '@/ui';
import { longDate, todayISO, dueLabel, isOverdue } from '@/lib/format';
import { todayRings, ringsToData } from '@/features/attivita/logic';
import { pendingToday, currentStreak } from '@/features/abitudini/logic';
import { WaterCard } from '@/features/acqua/WaterCard';
import { startOfWeek } from 'date-fns';
import { cn } from '@/lib/cn';
import { useT, type TKey } from '@/i18n';

export function TodayPage() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const lastWeight = useLiveQuery(() => db.weightLogs.orderBy('date').reverse().limit(1).toArray(), [], []);

  const s = settings ?? defaultSettings();
  const today = todayISO();
  const allTasks = tasks ?? [];

  const rings = todayRings(workouts ?? [], s);

  // "Da fare oggi": tasks due today or overdue + pending habits
  const dueTasks = allTasks
    .filter((t) => t.status !== 'done' && (t.dueDate === today || (t.dueDate && isOverdue(t.dueDate))))
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  const pendingHabits = pendingToday(habits ?? [], logs ?? []);

  // "Prossimi impegni": upcoming tasks (next days)
  const upcoming = allTasks
    .filter((t) => t.status !== 'done' && t.dueDate && t.dueDate > today)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5);

  // Quick stats
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  const workoutsThisWeek = (workouts ?? []).filter((w) => w.startedAt >= weekStart).length;
  const tasksClosedToday = allTasks.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= new Date().setHours(0, 0, 0, 0)).length;
  const bestStreak = Math.max(0, ...(habits ?? []).filter((h) => !h.archived).map((h) => currentStreak(h, logs ?? [])));

  const greeting = greetByHour(s.name, t);
  const nothingTodo = dueTasks.length === 0 && pendingHabits.length === 0;

  return (
    <>
      <PageHeader title={greeting} subtitle={longDate()} />
      <Screen>
        {/* Activity rings */}
        <Link to="/attivita">
          <Card className="flex items-center gap-5 mb-4 active:bg-section transition-colors">
            <ActivityRings rings={ringsToData(rings)} size={104} stroke={11} />
            <div className="flex-1 space-y-2">
              <RingLine label={t('activity.ring.move')} value={rings.move.value} goal={rings.move.goal} unit={t('activity.unit.kcal')} color="var(--c-activity)" />
              <RingLine label={t('activity.ring.exercise')} value={rings.exercise.value} goal={rings.exercise.goal} unit={t('activity.unit.min')} color="var(--c-habit)" />
              <RingLine label={t('activity.ring.stand')} value={rings.stand.value} goal={rings.stand.goal} unit={t('activity.unit.hours')} color="var(--c-project)" />
            </div>
          </Card>
        </Link>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatTile label={t('today.stat.streak')} value={bestStreak} unit={t('today.unit.days')} accent="var(--c-habit)" icon={<Flame size={14} />} />
          <StatTile label={t('today.stat.week')} value={workoutsThisWeek} unit={t('today.unit.workouts')} accent="var(--c-activity)" icon={<Dumbbell size={14} />} />
          <StatTile label={t('today.stat.closed')} value={tasksClosedToday} unit={t('today.unit.today')} accent="var(--c-project)" icon={<CheckCircle2 size={14} />} />
        </div>

        {/* Water */}
        <WaterCard settings={s} />

        {/* Weight (shows once there's at least one weigh-in) */}
        {lastWeight && lastWeight.length > 0 && (
          <Link to="/peso">
            <Card className="flex items-center gap-3 mb-4 active:bg-section transition-colors">
              <span className="h-10 w-10 rounded-full bg-project/10 flex items-center justify-center text-project flex-shrink-0">
                <Scale size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="metric-label">{t('weight.current')}</div>
                <div className="text-xl font-semibold tnum text-ink leading-tight mt-0.5">
                  {Math.round((s.body.unit === 'lb' ? lastWeight[0].weightKg * 2.20462 : lastWeight[0].weightKg) * 10) / 10} {s.body.unit}
                </div>
              </div>
              <ChevronRight size={18} className="text-ink-3" />
            </Card>
          </Link>
        )}

        {/* Da fare oggi */}
        <Card className="mb-4">
          <CardHeader title={t('today.todo')} />
          {nothingTodo ? (
            <EmptyState
              icon={<CheckCircle2 size={22} />}
              title={t('today.empty.title')}
              description={t('today.empty.desc')}
            />
          ) : (
            <div className="divide-y divide-divider">
              {dueTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <Checkbox checked={false} onChange={() => toggleTaskDone(t.id)} label={t.title} />
                  <span className="flex-1 text-[15px] text-ink truncate">{t.title}</span>
                  {t.dueDate && (
                    <span className={cn('text-[12px]', isOverdue(t.dueDate) ? 'text-danger font-medium' : 'text-ink-3')}>
                      {dueLabel(t.dueDate)}
                    </span>
                  )}
                </div>
              ))}
              {pendingHabits.map((h) => (
                <div key={h.id} className="flex items-center gap-3 py-2.5">
                  <Checkbox checked={false} color={h.color} onChange={() => toggleHabitLog(h.id, today)} label={h.name} />
                  <span className="flex-1 text-[15px] text-ink truncate">{h.name}</span>
                  <span className="text-[12px] font-medium" style={{ color: h.color }}>
                    {t('today.habit.badge')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Prossimi impegni */}
        {upcoming.length > 0 && (
          <Card>
            <CardHeader
              title={t('today.upcoming')}
              action={
                <Link to="/progetti" className="text-[13px] font-semibold text-project flex items-center gap-0.5">
                  {t('common.all')} <ChevronRight size={14} />
                </Link>
              }
            />
            <div className="divide-y divide-divider">
              {upcoming.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="h-8 w-8 rounded-full bg-section flex items-center justify-center text-ink-3 flex-shrink-0">
                    <ListTodo size={16} />
                  </span>
                  <span className="flex-1 text-[15px] text-ink truncate">{t.title}</span>
                  <span className="text-[12px] text-ink-2">{dueLabel(t.dueDate!)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Screen>
    </>
  );
}

function RingLine({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-medium" style={{ color }}>
        {label}
      </span>
      <span className="text-[13px] tnum text-ink-2">
        <span className="font-semibold text-ink">{value}</span>/{goal} {unit}
      </span>
    </div>
  );
}

function greetByHour(name: string, t: (k: TKey) => string): string {
  const h = new Date().getHours();
  const base = t(h < 12 ? 'greet.morning' : h < 18 ? 'greet.afternoon' : 'greet.evening');
  return name ? `${base}, ${name}` : base;
}
