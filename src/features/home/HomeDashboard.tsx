import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Quote, ChevronRight, Settings2, Check, Flame, Plus, Footprints, LayoutGrid, Droplet, Bell, Sparkles, X, Wallet, PenLine, ListChecks } from 'lucide-react';
import { subDays, format, startOfWeek, addDays } from 'date-fns';
import { ProgressRing, ActivityRings, StarMascot, Icon, useToast, Sheet, Confetti } from '@/ui';
import { DateStrip } from '@/ui/DateStrip';
import { useT, type TKey } from '@/i18n';
import { db } from '@/data/db';
import { readSettings, toggleHabitLog, createHabit, addWaterMl } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { todayISO, longDate } from '@/lib/format';
import { computeMomentum, stellaMood, momentumMessageKey, getStreakState } from '@/features/oggi/momentum';
import { todayRings, ringsToData, mergeHealthRings } from '@/features/attivita/logic';
import { isScheduled, isDone, currentStreak } from '@/features/abitudini/logic';
import { habitDisplayName, recommendedForGoal } from '@/features/abitudini/recommended';
import { useHealthSummary } from '@/platform/health';
import { AFFIRMATIONS } from '@/features/oggi/coach';
import { dayPoints, type LifeData } from '@/features/gamification/logic';
import { DailyWin } from '@/features/oggi/DailyWin';
import { useStella } from '@/features/stella';
import { useNavItems } from '@/app/nav';
import { platform } from '@/platform/platform';
import { refreshStreakNudge } from '@/features/notify/smart';
import { syncWidgetData, drainWidgetWaterInbox } from '@/platform/widget';
import type { Habit, HabitLog, ModuleId } from '@/data/types';

const ALLDONE_KEY = 'vita.allhabits.shown';
const STEPS_GOAL = 8000;

const WIN_KEY = 'vita.dailywin.shown';
const WELCOME_KEY = 'vita.welcomed';
const CONFETTI_KEY = 'vita.confetti.shown';
const GOLD = '#C9A227';

/** Quick actions surfaced on Home, filtered to the user's enabled modules. */
const QUICK_ACTIONS = [
  { id: 'acqua', to: '/acqua', icon: Droplet, key: 'qa.water' as const, color: '#0EA5E9', instant: true },
  { id: 'abitudini', to: '/abitudini', icon: Flame, key: 'qa.habit' as const, color: 'var(--c-habit)' },
  { id: 'finanze', to: '/finanze', icon: Wallet, key: 'qa.expense' as const, color: 'var(--c-finance)' },
  { id: 'progetti', to: '/progetti', icon: ListChecks, key: 'qa.task' as const, color: 'var(--c-project)' },
  { id: 'diario', to: '/diario', icon: PenLine, key: 'qa.journal' as const, color: 'var(--c-journal)' },
  { id: 'attivita', to: '/attivita', icon: Footprints, key: 'qa.workout' as const, color: 'var(--c-activity)' },
] as const;

/** Goal → personalized greeting line (set during onboarding). */
const GOAL_LINE: Record<NonNullable<import('@/data/types').Settings['goal']>, TKey> = {
  feel_better: 'home.goalline.feel_better',
  get_organized: 'home.goalline.get_organized',
  reduce_stress: 'home.goalline.reduce_stress',
  build_consistency: 'home.goalline.build_consistency',
  reach_goal: 'home.goalline.reach_goal',
};

/** Soft translucent wash of any color (hex or CSS var) — works for tiles. */
const wash = (c: string, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/** Animate a number from 0 → target with an ease-out, for a premium count-up. */
function useCountUp(target: number, ms = 900): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

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
  const toast = useToast();
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
  const greeting = greetByHour(s.name, t);
  const animScore = useCountUp(m.score);
  const goalLine = s.goal ? t(GOAL_LINE[s.goal]) : null;
  const [welcomed, setWelcomed] = useState(() => {
    try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch { return true; }
  });
  function dismissWelcome() {
    try { localStorage.setItem(WELCOME_KEY, '1'); } catch { /* ignore */ }
    setWelcomed(true);
  }

  // Celebrate a perfect day (momentum 100) once per day.
  const [confetti, setConfetti] = useState(false);
  useEffect(() => {
    if (m.score < 100) return;
    let shown = '';
    try { shown = localStorage.getItem(CONFETTI_KEY) ?? ''; } catch { /* ignore */ }
    if (shown === today) return;
    setConfetti(true);
    platform.haptic();
    try { localStorage.setItem(CONFETTI_KEY, today); } catch { /* ignore */ }
  }, [m.score, today]);

  // Quick actions, filtered to the modules the user enabled in onboarding.
  const quickActions = QUICK_ACTIONS.filter((q) => !s.enabledModules || s.enabledModules.includes(q.id as ModuleId)).slice(0, 4);
  function runQuick(q: (typeof QUICK_ACTIONS)[number]) {
    platform.haptic();
    if (q.id === 'acqua') {
      void addWaterMl(today, s.water.glassMl || 200);
      toast.show(t('qa.waterDone'));
    } else {
      navigate(q.to);
    }
  }

  // Motivational phrase rotates every 10s (starts at a day-based offset so it
  // doesn't always begin from the same one).
  const [affirmIdx, setAffirmIdx] = useState(() => Math.floor(Date.now() / 86_400_000) % AFFIRMATIONS.length);
  useEffect(() => {
    const id = setInterval(() => setAffirmIdx((i) => (i + 1) % AFFIRMATIONS.length), 20_000);
    return () => clearInterval(id);
  }, []);
  const affirmation = t(AFFIRMATIONS[affirmIdx] as TKey);

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

  const doneToday = routine.filter((h) => isDone(logs ?? [], h.id, today)).length;
  const pending = routine.length - doneToday;
  const streak = getStreakState().count;
  const allDone = routine.length > 0 && pending === 0;
  const steps = healthSummary?.steps ?? 0;

  // Apply water logged from the interactive widget, on mount and on foreground.
  useEffect(() => {
    const drain = () => void drainWidgetWaterInbox((ml) => addWaterMl(today, ml));
    drain();
    const onVisible = () => document.visibilityState === 'visible' && drain();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [today]);

  // Mirror water + reminders + to-dos into the shared App Group so the
  // Home/Lock-Screen widgets can display them.
  useEffect(() => {
    const reminders = Object.entries(s.reminders ?? {})
      .filter(([, time]) => !!time)
      .map(([kind, time]) => ({ label: t(`reminder.${kind}.title` as TKey), time: time as string }))
      .sort((a, b) => a.time.localeCompare(b.time));
    const openTasks = (tasks ?? [])
      .filter((tk) => tk.status !== 'done')
      .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || a.order - b.order)
      .slice(0, 12)
      .map((tk) => ({ title: tk.title, due: tk.dueDate }));

    // Habit widgets: current week (Mon..Sun) + last 49 days heatmap.
    const ll = logs ?? [];
    const enc = (h: Habit, d: string) => (!isScheduled(h, d) ? 0 : isDone(ll, h.id, d) ? 2 : 1);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
    const heatDays = Array.from({ length: 49 }, (_, i) => format(subDays(new Date(), 48 - i), 'yyyy-MM-dd'));
    const habitData = (habits ?? [])
      .filter((h) => !h.archived)
      .slice(0, 6)
      .map((h) => ({ name: habitDisplayName(h, t), color: h.color, week: weekDays.map((d) => enc(h, d)), heat: heatDays.map((d) => enc(h, d)) }));

    void syncWidgetData({
      water: { ml: todayWater?.ml ?? 0, goalMl: s.water.dailyGoalMl, glassMl: s.water.glassMl || 200 },
      reminders,
      tasks: openTasks,
      habits: habitData,
    });
  }, [s, todayWater, tasks, habits, logs, t]);

  // Smart notification: (re)schedule the adaptive evening streak nudge whenever
  // today's pending count or the streak changes.
  useEffect(() => {
    void refreshStreakNudge({
      pending,
      streak,
      title: t('notify.streak.title'),
      bodyStreak: t('notify.streak.bodyStreak'),
      body: t('notify.streak.body'),
    });
  }, [pending, streak, t]);

  // Celebrate (once per day) the moment every habit for today is complete.
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const celebrated = useRef(false);
  useEffect(() => {
    if (!allDone) return;
    let shown = '';
    try {
      shown = localStorage.getItem(ALLDONE_KEY) ?? '';
    } catch {
      /* ignore */
    }
    if (shown === today || celebrated.current) return;
    celebrated.current = true;
    try {
      localStorage.setItem(ALLDONE_KEY, today);
    } catch {
      /* ignore */
    }
    platform.haptic();
    toast.show(t('home.routine.allDone'));
  }, [allDone, today, t, toast]);

  async function addSuggested(rec: ReturnType<typeof recommendedForGoal>[number]) {
    platform.haptic();
    await createHabit({ name: t(rec.labelKey), recId: rec.id, color: rec.color, icon: rec.icon, frequency: rec.frequency });
    toast.show(t('home.habitAdded'));
  }

  return (
    <div className="min-h-[100dvh] bg-app relative overflow-hidden">
      {/* Warm ambient hero: soft glow + faint leaf texture behind the top. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px]" style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 60%, transparent), transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px] opacity-[0.05] bg-center bg-cover" style={{ backgroundImage: "url('/leaf-tex.png')" }} />
      <div className="relative max-w-2xl mx-auto px-4 pt-safe-top pb-[calc(116px+env(safe-area-inset-bottom))]">
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
            {goalLine && <p className="text-[12.5px] text-ink-2 leading-snug truncate mt-0.5">{goalLine}</p>}
          </div>
          <button
            onClick={() => navigate('/impostazioni')}
            aria-label={t('nav.settings')}
            className="h-11 w-11 flex-shrink-0 rounded-full bg-card shadow-chip flex items-center justify-center text-ink-2 active:scale-90 transition-transform"
          >
            <Settings2 size={20} />
          </button>
        </header>

        {/* Personalized welcome — shown once after onboarding. */}
        {!welcomed && (
          <section
            className="mt-3 rounded-card p-4 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${GOLD} 18%, var(--c-card)), var(--c-card))`, boxShadow: `0 10px 30px ${GOLD}22` }}
          >
            <button onClick={dismissWelcome} aria-label={t('common.close')} className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/5 flex items-center justify-center text-ink-2 active:scale-90">
              <X size={15} />
            </button>
            <div className="flex items-center gap-2 pr-8">
              <span className="h-9 w-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}26`, color: GOLD }}>
                <Sparkles size={18} />
              </span>
              <h2 className="text-[17px] font-extrabold text-ink leading-tight">
                {s.name ? t('home.welcome.title', { name: s.name }) : t('home.welcome.titleNoName')}
              </h2>
            </div>
            <p className="text-[13px] text-ink-2 leading-snug mt-2">{t('home.welcome.desc')}</p>
            {modules.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {modules.slice(0, 5).map((mod) => (
                  <span key={mod.to} className="inline-flex items-center gap-1 rounded-full px-2.5 h-7 text-[12px] font-bold" style={{ background: wash(mod.accent ?? 'var(--c-ink-2)', 14), color: mod.accent ?? 'var(--c-ink-2)' }}>
                    {t(mod.shortKey ?? mod.labelKey)}
                  </span>
                ))}
              </div>
            )}
            <button onClick={dismissWelcome} className="mt-4 w-full h-11 rounded-full font-bold text-[15px] text-white active:scale-[0.98] transition-transform" style={{ background: GOLD }}>
              {t('home.welcome.dismiss')}
            </button>
          </section>
        )}

        {/* This week */}
        <DateStrip marked={activeDays} className="mt-3 mb-4" />

        {/* Hero momentum card */}
        <section
          className="rounded-card p-5 shadow-card relative overflow-hidden"
          style={{ background: 'linear-gradient(140deg, var(--c-hero-1) 0%, var(--c-hero-2) 100%)' }}
        >
          <div className="flex items-center gap-4">
            <ProgressRing progress={animScore / 100} size={84} stroke={9} gradient={[GOLD, 'var(--c-primary)']} trackColor="rgba(0,0,0,0.08)">
              <StarMascot size={52} mood={stellaMood(m.score)} animated={m.score >= 80} />
            </ProgressRing>
            <Link to="/recap" className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink/55">{t('momentum.title')}</span>
                <ChevronRight size={16} className="text-ink/40 ml-auto" />
              </div>
              <div className="text-[34px] font-extrabold tnum text-ink leading-none mt-1">
                {animScore}
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

        {/* Quick actions — tailored to the user's enabled modules */}
        {quickActions.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {quickActions.map((q) => {
              const Ico = q.icon;
              return (
                <button
                  key={q.id}
                  onClick={() => runQuick(q)}
                  className="flex items-center gap-1.5 rounded-full pl-3 pr-3.5 h-10 flex-shrink-0 active:scale-95 transition-transform"
                  style={{ background: wash(q.color, 15), color: q.color }}
                >
                  <Ico size={16} strokeWidth={2.5} />
                  <span className="text-[13px] font-bold whitespace-nowrap">{t(q.key)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Daily phrase — right under the momentum hero */}
        <section className="mt-3 rounded-card p-4 flex items-center gap-3" style={{ background: wash('var(--c-journal)', 14) }}>
          <span className="flex-shrink-0 text-journal">
            <Quote size={20} fill="currentColor" />
          </span>
          <p className="text-[14px] font-bold text-ink italic leading-snug">{affirmation}</p>
        </section>

        {/* Steps (from Apple Health, when connected) */}
        {steps > 0 && (
          <div className="mt-3 bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-4">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: wash('var(--c-activity)', 16), color: 'var(--c-activity)' }}>
                <Footprints size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="metric-label">{t('home.steps.title')}</div>
                <div className="text-xl font-extrabold tnum text-ink leading-tight">
                  {steps.toLocaleString()} <span className="text-ink-3 text-[13px] font-semibold">/ {STEPS_GOAL.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 h-2 rounded-full bg-section overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (steps / STEPS_GOAL) * 100)}%`, background: 'var(--c-activity)' }} />
            </div>
          </div>
        )}

        {/* Today's routine (habits) */}
        <section className="mt-3 bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-extrabold text-ink">{t('home.routine.title')}</h2>
              {routine.length > 0 && !allDone && streak >= 2 && pending > 0 ? (
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-streak bg-streak/10 rounded-full px-2 py-0.5">
                  {t('home.routine.atRisk', { n: streak })}
                </span>
              ) : routine.length > 0 ? (
                <p className="text-[12px] font-semibold text-ink-3 mt-0.5">{t('home.routine.progress', { done: doneToday, total: routine.length })}</p>
              ) : null}
            </div>
            <Link to="/abitudini" className="text-[13px] font-bold text-primary">{t('home.routine.all')}</Link>
          </div>

          {routine.length === 0 ? (
            <div>
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
              <div className="mt-3">
                <div className="metric-label mb-2">{t('home.routine.empty.suggest')}</div>
                <div className="flex flex-wrap gap-2">
                  {recommendedForGoal(s.goal).slice(0, 4).map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => addSuggested(rec)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 h-9 text-[13px] font-bold active:scale-95 transition-transform"
                      style={{ background: wash(rec.color, 14), color: rec.color }}
                    >
                      <Plus size={14} /> {t(rec.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {routine.slice(0, 6).map((h) => (
                <RoutineRow key={h.id} habit={h} logs={logs ?? []} today={today} t={t} />
              ))}
            </div>
          )}
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

        {/* Widgets promo — moved to the bottom */}
        <button
          onClick={() => setWidgetsOpen(true)}
          className="mt-5 w-full flex items-center gap-3 rounded-card p-4 text-left active:scale-[0.99] transition-transform"
          style={{ background: wash('var(--c-habit)', 13) }}
        >
          <span className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--c-card)', color: 'var(--c-habit)' }}>
            <LayoutGrid size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold text-ink">{t('home.widgets.title')}</div>
            <div className="text-[12px] text-ink-2 leading-snug">{t('home.widgets.desc')}</div>
          </div>
          <ChevronRight size={18} className="text-ink-3 flex-shrink-0" />
        </button>
      </div>

      {win && <DailyWin streak={win.streak} pointsToday={win.today} pointsYesterday={win.yesterday} onClose={closeWin} />}
      {confetti && <Confetti onDone={() => setConfetti(false)} />}

      <Sheet open={widgetsOpen} onClose={() => setWidgetsOpen(false)} title={t('widgets.sheet.title')}>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-2xl p-3.5 flex flex-col items-center text-center gap-1.5" style={{ background: wash('#0EA5E9', 14) }}>
            <Droplet size={24} style={{ color: '#0EA5E9' }} />
            <span className="text-[13px] font-bold text-ink">{t('widgets.water')}</span>
          </div>
          <div className="flex-1 rounded-2xl p-3.5 flex flex-col items-center text-center gap-1.5" style={{ background: wash('var(--c-finance)', 14) }}>
            <Bell size={24} style={{ color: 'var(--c-finance)' }} />
            <span className="text-[13px] font-bold text-ink">{t('widgets.reminders')}</span>
          </div>
        </div>
        <p className="text-[13px] text-ink-2 leading-relaxed mb-4">{t('widgets.sheet.intro')}</p>
        <ol className="space-y-3">
          {([1, 2, 3, 4] as const).map((n) => (
            <li key={n} className="flex gap-3">
              <span className="h-6 w-6 rounded-full bg-habit text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">{n}</span>
              <span className="text-[14px] text-ink leading-snug">{t(`widgets.step${n}` as TKey)}</span>
            </li>
          ))}
        </ol>
      </Sheet>
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
        <div className={done ? 'text-[15px] font-semibold text-ink-3 line-through truncate' : 'text-[15px] font-semibold text-ink truncate'}>{habitDisplayName(habit, t)}</div>
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
        aria-label={habitDisplayName(habit, t)}
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
