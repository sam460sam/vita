import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Quote, ChevronRight } from 'lucide-react';
import { subDays } from 'date-fns';
import { PageHeader } from '@/app/PageHeader';
import { ProgressRing, ActivityRings, StarMascot } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { db } from '@/data/db';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { todayISO, longDate } from '@/lib/format';
import { computeMomentum, stellaMood, momentumMessageKey, getStreakState } from '@/features/oggi/momentum';
import { todayRings, ringsToData, mergeHealthRings } from '@/features/attivita/logic';
import { useHealthSummary } from '@/platform/health';
import { dailyAffirmation } from '@/features/oggi/coach';
import { dayPoints, type LifeData } from '@/features/gamification/logic';
import { DailyWin } from '@/features/oggi/DailyWin';
import { BackupNudge } from '@/features/backup';
import { WaterCard } from '@/features/acqua/WaterCard';
import { useStella } from '@/features/stella';
import { useNavItems } from '@/app/nav';

const WIN_KEY = 'vita.dailywin.shown';

/**
 * Unified home — a single, fixed, one-screen page (no widget grid):
 * panda momentum + activity rings, a daily motivational phrase right below the
 * panda, the water tracker, and quick links to every enabled module.
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

  const m = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], todayWater, journals ?? []);
  const healthSummary = useHealthSummary();
  const rings = mergeHealthRings(todayRings(workouts ?? [], s), healthSummary);
  const affirmation = t(dailyAffirmation() as TKey);
  const greeting = greetByHour(s.name, t);

  // --- Daily Win celebration (once per day when the day is going great) ----
  const today = todayISO();
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

  return (
    <div className="h-[100dvh] flex flex-col bg-app overflow-hidden">
      <PageHeader title={greeting} subtitle={longDate()} />

      <div className="flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 pt-2 pb-[calc(92px+env(safe-area-inset-bottom))] flex flex-col gap-2.5 overflow-hidden">
        <BackupNudge hasData={hasData} />

        {/* Momentum (panda) + Activity rings */}
        <section className="rounded-card bg-card shadow-card border border-line/40 dark:border-transparent p-4 flex-none">
          <div className="flex items-center gap-4">
            <button onClick={stella.open} aria-label={t('stella.name')} className="flex-shrink-0 active:scale-95 transition-transform">
              <ProgressRing progress={m.score / 100} size={64} stroke={7} color="var(--c-habit)">
                <StarMascot size={40} mood={stellaMood(m.score)} animated={m.score >= 80} />
              </ProgressRing>
            </button>
            <Link to="/recap" className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="metric-label">{t('momentum.title')}</span>
                <ChevronRight size={16} className="text-ink-3 ml-auto" />
              </div>
              <div className="text-2xl font-bold tnum text-ink leading-tight mt-0.5">
                {m.score}
                <span className="text-ink-3 text-base font-semibold">/100</span>
              </div>
              <p className="text-[13px] text-ink-2 leading-snug mt-0.5 line-clamp-2">{t(momentumMessageKey(m.score) as TKey)}</p>
            </Link>
          </div>

          <Link to="/attivita" className="flex items-center gap-3 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
            <ActivityRings rings={ringsToData(rings)} size={58} stroke={7} />
            <div className="grid grid-cols-3 gap-2 flex-1 min-w-0">
              <RingStat label={t('activity.ring.move')} value={rings.move.value} goal={rings.move.goal} color="var(--c-activity)" />
              <RingStat label={t('activity.ring.exercise')} value={rings.exercise.value} goal={rings.exercise.goal} color="var(--c-habit)" />
              <RingStat label={t('activity.ring.stand')} value={rings.stand.value} goal={rings.stand.goal} color="var(--c-project)" />
            </div>
          </Link>
        </section>

        {/* Daily motivational phrase — directly below the panda */}
        <section className="rounded-card bg-journal-tint p-4 flex items-center gap-3 flex-none">
          <span className="flex-shrink-0 text-journal">
            <Quote size={20} fill="currentColor" />
          </span>
          <p className="text-[14px] font-semibold text-ink italic leading-snug">{affirmation}</p>
        </section>

        {/* Water tracker */}
        <div className="flex-none [&>div]:!mb-0">
          <WaterCard settings={s} />
        </div>

        {/* Module shortcuts (collegamenti) */}
        <nav className="flex-1 min-h-0">
          <div className="grid grid-cols-4 gap-2 h-full [grid-auto-rows:minmax(0,1fr)]">
            {modules.map((mod) => {
              const Icon = mod.icon;
              const accent = mod.accent ?? 'var(--c-ink-2)';
              return (
                <button
                  key={mod.to}
                  onClick={() => navigate(mod.to)}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-card shadow-card border border-line/40 dark:border-transparent py-2 min-h-0 overflow-hidden active:scale-95 transition-transform"
                >
                  <span
                    className="h-9 w-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: accent.replace(')', '-tint)'), color: accent }}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-[11px] font-semibold text-ink-2 truncate max-w-full px-1">{t(mod.shortKey ?? mod.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {win && <DailyWin streak={win.streak} pointsToday={win.today} pointsYesterday={win.yesterday} onClose={closeWin} />}
    </div>
  );
}

function RingStat({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wide truncate" style={{ color }}>
        {label}
      </div>
      <div className="text-[13px] font-bold tnum text-ink leading-tight">
        {value}
        <span className="text-ink-3 text-[11px] font-medium">/{goal}</span>
      </div>
    </div>
  );
}

function greetByHour(name: string, t: (k: TKey) => string): string {
  const h = new Date().getHours();
  const base = t(h < 12 ? 'greet.morning' : h < 18 ? 'greet.afternoon' : 'greet.evening');
  return name ? `${base}, ${name}` : base;
}
