import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Quote, ChevronRight, Settings2, Check, Flame, Plus } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { ProgressRing, ActivityRings, StarMascot, Icon } from '@/ui';
import { DateStrip } from '@/ui/DateStrip';
import { useT, type TKey } from '@/i18n';
import { db } from '@/data/db';
import { readSettings, toggleHabitLog } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { todayISO, longDate } from '@/lib/format';
import { computeMomentum, stellaMood, momentumMessageKey, getStreakState } from '@/features/oggi/momentum';
import { todayRings, ringsToData, mergeHealthRings } from '@/features/attivita/logic';
import { isScheduled, isDone, currentStreak } from '@/features/abitudini/logic';
import { useHealthSummary } from '@/platform/health';
import { dailyAffirmation } from '@/features/oggi/coach';
import { dayPoints, type LifeData } from '@/features/gamification/logic';
import { DailyWin } from '@/features/oggi/DailyWin';
import { BackupNudge } from '@/features/backup';
import { WaterCard } from '@/features/acqua/WaterCard';
import { useStella } from '@/features/stella';
import { useNavItems } from '@/app/nav';
import { platform } from '@/platform/platform';
import type { Habit, HabitLog } from '@/data/types';

const WIN_KEY = 'vita.dailywin.shown';

/** Soft translucent wash of any color (hex or CSS var) — works for tiles. */
const wash = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/**
 * Home — the flagship. A warm, scrollable "today" canvas: big greeting, this
 * week's date strip, a hero momentum card with the panda + activity rings, the
 * water tracker, today's routine (habits) as a tappable checklist, a daily
 * phrase, and quick links to every module.
 */
export function HomeDashboard() {
  const t = useT();
  const navigate = useNavigate();
  const stella = useStella();
  const { modules } = useNavItems();

  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const s = settings ?? defaultSettings();
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const weights = useLiveQuery(() => db.weightLogs.toArray(), [], []);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);
  const todayWater = useLiveQuery(() => db.waterLogs.get(todayISO()), [], undefined);

  const today = todayISO();
  const m = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], todayWater, journals ?? []);
  const healthSummary = useHealthSummary();
  const rings = mergeHealthRings(todayRings(workouts ?? [], s), healthSummary);
  const affirmation = t(dailyAffirmation() as TKey);
  const greeting = greetByHour(s.name, t);

  // Days this week that already have activity (for the date-strip dots).
  const activeDays = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs ?? []) if (l.done) set.add(l.date);
    for (const w of workouts ?? []) set.add(format(w.startedAt, 'yyyy-MM-dd'));
    for (const j of journals ?? []) set.add(j.date);
    return set;
  }, [logs, workouts, journals]);

  // Today's routine — habits scheduled today (done ones sink to the bottom).
  const routine = useMemo(() => {
    const list = (habits ?? []).filter((h) => !h.archived && isScheduled(h, today));
    return list.sort((a, b) => {
      const da = isDone(logs ?? [], a.id, today) ? 1 : 0;
      const dbn = isDone(logs ?? [], b.id, today) ? 1 : 0;
      return da - dbn || a.order - b.order;
    });
  }, [habits, logs, today]);

  // --- Daily Win celebration (once per day when the day is going great) ----
  const [win, setWin] = useState<{ streak: number; today: number; yesterday: number } | null>(null);
  useEffect(() => {
    if (m.score < 70) return;
    let shown = '';
    try {
      shown = localStorage.getItem(WIN_KEY) ?? '';
    } catch {
      /* ignore */
    }
    if (shown === today) return;
    const d: LifeData = { settings: s, habits: habits ?? [], logs: logs ?? [], tasks: tasks ?? [], workouts: workouts ?? [], waters: waters ?? [], journals: journals ?? [], weights: weights ?? [] };
    setWin({ streak: getStreakState().count, today: dayPoints(d, today), yesterday: dayPoints(d, todayISO(subDays(new Date(), 1))) });
  }, [m.score, today, s, habits, logs, tasks, workouts, waters, journals, weights]);
  function closeWin() {
    try {
      localStorage.setItem(WIN_KEY, today);
    } catch {
      /* ignore */
    }
    setWin(null);
  }

  const hasData = (habits?.length ?? 0) + (tasks?.length ?? 0) + (workouts?.length ?? 0) + (journals?.length ?? 0) + (weights?.length ?? 0) > 0;
  const doneToday = routine.filter((h) => isDone(logs ?? [], h.id, today)).length;

  return (
    <div className="min-h-[100dvh] bg-app">
      <div className="max-w-2xl mx-auto px-4 pt-safe-top pb-[calc(116px+env(safe-area-inset-bottom))]">
        {/* Greeting header */}
        <header className="flex items-center gap-3 pt-4 pb-1">
          <button onClick={stella.open} aria-label={t('stella.name')} className="flex-shrink-0 active:scale-95 transition-transform">
            <span className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(140deg, var(--c-hero-1), var(--c-hero-2))' }}>
              <StarMascot size={34} mood={stellaMood(m.score)} animated={m.score >= 80} />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-ink-3 capitalize leading-none">{longDate()}</p>
            <h1 className="text-[24px] font-extrabold text-ink leading-tight truncate mt-0.5">{greeting} 👋</h1>
          </div>
          <button
            onClick={() => navigate('/impostazioni')}
            aria-label={t('nav.settings')}
            className="h-11 w-11 flex-shrink-0 rounded-full bg-card shadow-chip flex items-center justify-center text-ink-2 active:scale-90 transition-transform"
          >
            <Settings2 size={20} />
          </button>
        </header>

        <BackupNudge hasData={hasData} />

        {/* This week */}
        <DateStrip marked={activeDays} className="mt-3 mb-4" />

        {/* Hero momentum card */}
        <section
          className="rounded-card p-5 shadow-card relative overflow-hidden"
          style={{ background: 'linear-gradient(140deg, var(--c-hero-1) 0%, var(--c-hero-2) 100%)' }}
        >
          <div className="flex items-center gap-4">
            <ProgressRing progress={m.score / 100} size={76} stroke={8} color="var(--c-primary)">
              <StarMascot size={48} mood={stellaMood(m.score)} animated={m.score >= 80} />
            </ProgressRing>
            <Link to="/recap" className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink/55">{t('momentum.title')}</span>
                <ChevronRight size={16} className="text-ink/40 ml-auto" />
              </div>
              <div className="text-[34px] font-extrabold tnum text-ink leading-none mt-1">
                {m.score}
                <span className="text-ink/40 text-lg font-bold">/100</span>
              </div>
              <p className="text-[13px] font-medium text-ink/70 leading-snug mt-1 line-clamp-2">{t(momentumMessageKey(m.score) as TKey)}</p>
            </Link>
          </div>

          <Link to="/attivita" className="flex items-center gap-3 mt-4 pt-4 border-t border-black/10">
            <ActivityRings rings={ringsToData(rings)} size={56} stroke={7} />
            <div className="grid grid-cols-3 gap-2 flex-1 min-w-0">
              <RingStat label={t('activity.ring.move')} value={rings.move.value} goal={rings.move.goal} color="var(--c-activity)" />
              <RingStat label={t('activity.ring.exercise')} value={rings.exercise.value} goal={rings.exercise.goal} color="var(--c-habit)" />
              <RingStat label={t('activity.ring.stand')} value={rings.stand.value} goal={rings.stand.goal} color="var(--c-project)" />
            </div>
          </Link>
        </section>

        {/* Water */}
        <div className="mt-3 [&>div]:!mb-0">
          <WaterCard settings={s} />
        </div>

        {/* Today's routine (habits) */}
        <section className="mt-3 bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-extrabold text-ink">{t('home.routine.title')}</h2>
              {routine.length > 0 && (
                <p className="text-[12px] font-semibold text-ink-3 mt-0.5">{t('home.routine.progress', { done: doneToday, total: routine.length })}</p>
              )}
            </div>
            <Link to="/abitudini" className="text-[13px] font-bold text-primary">{t('home.routine.all')}</Link>
          </div>

          {routine.length === 0 ? (
            <button
              onClick={() => navigate('/abitudini')}
              className="w-full flex items-center gap-3 rounded-2xl border-2 border-dashed border-line py-4 px-4 text-left active:scale-[0.99] transition-transform"
            >
              <span className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: wash('var(--c-habit)', 16), color: 'var(--c-habit)' }}>
                <Plus size={20} />
              </span>
              <div>
                <div className="text-[14px] font-bold text-ink">{t('home.routine.empty.title')}</div>
                <div className="text-[12px] text-ink-2">{t('home.routine.empty.desc')}</div>
              </div>
            </button>
          ) : (
            <div className="space-y-1.5">
              {routine.slice(0, 6).map((h) => (
                <RoutineRow key={h.id} habit={h} logs={logs ?? []} today={today} t={t} />
              ))}
            </div>
          )}
        </section>

        {/* Daily phrase */}
        <section className="mt-3 rounded-card p-4 flex items-center gap-3" style={{ background: wash('var(--c-journal)', 14) }}>
          <span className="flex-shrink-0 text-journal">
            <Quote size={20} fill="currentColor" />
          </span>
          <p className="text-[14px] font-bold text-ink italic leading-snug">{affirmation}</p>
        </section>

        {/* Explore modules */}
        <h2 className="text-[16px] font-extrabold text-ink mt-5 mb-2.5 px-1">{t('home.explore')}</h2>
        <nav className="grid grid-cols-4 gap-2.5">
          {modules.map((mod) => {
            const Ico = mod.icon;
            const accent = mod.accent ?? 'var(--c-ink-2)';
            return (
              <button
                key={mod.to}
                onClick={() => navigate(mod.to)}
                className="flex flex-col items-center justify-center gap-2 rounded-3xl py-3.5 active:scale-95 transition-transform"
                style={{ background: wash(accent, 13) }}
              >
                <span className="flex items-center justify-center" style={{ color: accent }}>
                  <Ico size={23} strokeWidth={2.25} />
                </span>
                <span className="text-[11px] font-bold truncate max-w-full px-1" style={{ color: accent }}>{t(mod.shortKey ?? mod.labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {win && <DailyWin streak={win.streak} pointsToday={win.today} pointsYesterday={win.yesterday} onClose={closeWin} />}
    </div>
  );
}

function RoutineRow({ habit, logs, today, t }: { habit: Habit; logs: HabitLog[]; today: string; t: (k: TKey, v?: Record<string, string | number>) => string }) {
  const done = isDone(logs, habit.id, today);
  const streak = currentStreak(habit, logs);
  const color = habit.color || 'var(--c-habit)';

  function toggle() {
    platform.haptic();
    void toggleHabitLog(habit.id, today);
  }

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: wash(color, 16), color }}>
        <Icon name={habit.icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={done ? 'text-[15px] font-semibold text-ink-3 line-through truncate' : 'text-[15px] font-semibold text-ink truncate'}>{habit.name}</div>
        <div className="flex items-center gap-1 text-[12px] text-ink-2 mt-0.5">
          {streak > 0 ? (
            <>
              <Flame size={12} className="text-streak" />
              {t('home.routine.streak', { n: streak })}
            </>
          ) : (
            t('home.routine.tapDone')
          )}
        </div>
      </div>
      <button
        onClick={toggle}
        aria-label={habit.name}
        aria-pressed={done}
        className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
        style={{ background: done ? color : 'transparent', border: done ? 'none' : '2px solid var(--c-line)' }}
      >
        {done && <Check size={17} className="text-white" strokeWidth={3} />}
      </button>
    </div>
  );
}

function RingStat({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-wide truncate" style={{ color }}>
        {label}
      </div>
      <div className="text-[13px] font-extrabold tnum text-ink leading-tight">
        {value}
        <span className="text-ink/40 text-[11px] font-bold">/{goal}</span>
      </div>
    </div>
  );
}

function greetByHour(name: string, t: (k: TKey) => string): string {
  const h = new Date().getHours();
  const base = t(h < 12 ? 'greet.morning' : h < 18 ? 'greet.afternoon' : 'greet.evening');
  return name ? `${base}, ${name}` : base;
}
