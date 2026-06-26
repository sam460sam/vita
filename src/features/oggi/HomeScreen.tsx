import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { startOfWeek, addDays, subDays, format } from 'date-fns';
import { Check, ChevronRight } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings, toggleHabitLog, setWaterMl, addWaterMl } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { ProgressRing, VioCompanion, Icon } from '@/ui';
import { longDate, todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { syncWidgetData, drainWidgetWaterInbox } from '@/platform/widget';
import { isScheduled, isDone } from '@/features/abitudini/logic';
import { habitDisplayName } from '@/features/abitudini/recommended';
import { UpdateNudge } from '@/features/update/UpdateNudge';
import { DayPlanCard } from '@/features/plan/DayPlanCard';
import { GoalsQuiz } from '@/features/plan/GoalsQuiz';
import { computeMomentum, momentumMessageKey } from './momentum';
import { useT, type TKey } from '@/i18n';
import type { Habit } from '@/data/types';
import vLogo from '/vyta-vmark.png';
import iconHabits from '/icons3d/habits.png';
import iconWater from '/icons3d/water.png';
import iconCompass from '/icons3d/clipboard.png';

/** Home — premium "Today" screen, faithful to the design north-star. */
export function HomeScreen() {
  const t = useT();
  const [quizOpen, setQuizOpen] = useState(false);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const todayWater = useLiveQuery(() => db.waterLogs.get(todayISO()), [], undefined);

  const s = settings ?? defaultSettings();
  const today = todayISO();
  const m = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], todayWater, journals ?? []);

  const hr = new Date().getHours();
  const greet = t(hr < 12 ? 'greet.morning' : hr < 18 ? 'greet.afternoon' : 'greet.evening');
  const greeting = s.name ? `${greet}, ${s.name}` : greet;
  // Vio's FACE reflects your Momentum: low → sleepy, mid → calm/waiting,
  // high → happy & cheering.
  const vioMood = m.score >= 67 ? 'happy' : m.score >= 34 ? 'waiting' : 'sleepy';

  const active = (habits ?? []).filter((x) => !x.archived);
  const todays = active.filter((x) => isScheduled(x, today));
  const pending = todays.filter((x) => !isDone(logs ?? [], x.id, today));

  const glassMl = s.water.glassMl || 250;
  const goalMl = s.water.dailyGoalMl || 2000;
  const ml = todayWater?.ml ?? 0;
  const fmtL = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')} L`;
  const dropTotal = Math.min(10, Math.max(6, Math.round(goalMl / glassMl)));
  const dropDone = Math.min(dropTotal, Math.round(ml / glassMl));

  // Apply any water logged from the home/lock-screen widget on launch.
  useEffect(() => { void drainWidgetWaterInbox((delta) => addWaterMl(today, delta)); }, [today]);

  // Mirror today's data (incl. Momentum) into the App Group so the widgets stay fresh.
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
    const ll = logs ?? [];
    const enc = (h: Habit, d: string) => (!isScheduled(h, d) ? 0 : isDone(ll, h.id, d) ? 2 : 1);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
    const heatDays = Array.from({ length: 49 }, (_, i) => format(subDays(new Date(), 48 - i), 'yyyy-MM-dd'));
    const habitData = active.slice(0, 6).map((h) => ({ name: habitDisplayName(h, t), color: h.color, week: weekDays.map((d) => enc(h, d)), heat: heatDays.map((d) => enc(h, d)) }));
    void syncWidgetData({
      water: { ml, goalMl, glassMl },
      reminders,
      tasks: openTasks,
      habits: habitData,
      momentum: { score: m.score, message: t(momentumMessageKey(m.score) as TKey) },
    });
  }, [s, ml, goalMl, glassMl, tasks, habits, logs, m.score, active, t, today]);

  return (
    <div className="min-h-[100dvh] bg-app relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[320px]" style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 50%, transparent), transparent 70%)' }} />
      <div className="relative max-w-2xl mx-auto px-5 pt-safe-top pb-[calc(116px+env(safe-area-inset-bottom))] animate-rise">
        {/* Greeting header */}
        <header className="flex items-start justify-between gap-3 pt-5 pb-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-ink-3 capitalize leading-none">{longDate()}</p>
            <h1 className="display-serif text-[30px] text-ink leading-tight mt-1.5 truncate">{greeting}</h1>
          </div>
          <Link to="/altro" aria-label={t('nav.more')} className="mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform" style={{ background: 'color-mix(in srgb, var(--c-habit) 14%, var(--c-card))' }}>
            <img src={vLogo} className="h-6 w-6 object-contain" alt="Vyta" draggable={false} />
          </Link>
        </header>

        {/* Update available (App Store has a newer version) */}
        <UpdateNudge />

        {/* Momentum + Vio */}
        <Link to="/recap" className="block">
          <div className="rounded-card bg-card shadow-card px-5 py-4 active:bg-section transition-colors">
            <h2 className="display-serif text-[21px] text-ink">Momentum</h2>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="flex-1 flex justify-center">
                <ProgressRing progress={m.score / 100} size={132} stroke={14} gradient={['#86C45A', '#1E8E4E']}>
                  <div className="flex items-baseline">
                    <span className="text-[32px] font-extrabold text-ink tnum leading-none">{m.score}</span>
                    <span className="text-[14px] font-bold text-ink-3"> / 100</span>
                  </div>
                </ProgressRing>
              </div>
              <div className="flex-1 flex justify-center">
                <VioCompanion score={m.score} mood={vioMood} size={138} animated />
              </div>
            </div>
            <p className="text-[14px] text-ink-2 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">{t(momentumMessageKey(m.score) as TKey)}</p>
          </div>
        </Link>

        {/* Hero tiles */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <HeroTile to="/abitudini" icon={iconHabits} label={t('nav.habits')} sub={t('home.tile.todo', { n: pending.length })} />
          <HeroTile to="/acqua" icon={iconWater} label={t('nav.water')} sub={`${fmtL(ml / 1000)} / ${fmtL(goalMl / 1000)}`} />
          <HeroTile to="/personalita" icon={iconCompass} label={t('nav.personality.short')} sub={t('home.tile.ready')} />
        </div>

        {/* Plan your day */}
        <DayPlanCard />

        {/* Routines */}
        <Link to="/routine" className="rounded-card bg-card shadow-card px-4 py-3.5 mt-3 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><span className="text-[20px]" aria-hidden>🌿</span> {t('routine.title')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>

        {/* Goals quiz */}
        <button onClick={() => setQuizOpen(true)} className="w-full rounded-card bg-card shadow-card px-4 py-3.5 mt-3 flex items-center justify-between active:bg-section transition-colors text-left">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><span className="text-[20px]" aria-hidden>🎯</span> {t('goalsq.cta')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </button>
        {quizOpen && <GoalsQuiz onClose={() => setQuizOpen(false)} />}

        {/* Today's habits */}
        <div className="flex items-center justify-between mt-6 mb-2.5">
          <h2 className="display-serif text-[22px] text-ink">{t('nav.today')}</h2>
          <Link to="/abitudini" className="text-[13px] font-semibold text-habit">{t('home.routine.all')}</Link>
        </div>
        <div className="rounded-card bg-card shadow-card p-2">
          {todays.length === 0 ? (
            <div className="p-4 text-center text-[14px] text-ink-2">{t('home.routine.empty.desc')}</div>
          ) : (
            todays.slice(0, 5).map((hb) => {
              const done = isDone(logs ?? [], hb.id, today);
              return (
                <button
                  key={hb.id}
                  onClick={() => { platform.haptic(); void toggleHabitLog(hb.id, today); }}
                  className="flex items-center gap-3 w-full px-3 rounded-2xl text-left transition-colors active:opacity-80"
                  style={{ minHeight: 52, background: done ? 'color-mix(in srgb, var(--c-habit) 14%, var(--c-card))' : 'transparent' }}
                >
                  <span
                    className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                    style={done ? { background: '#4F9D55', borderColor: '#4F9D55' } : { borderColor: 'var(--c-line)' }}
                  >
                    {done && <Check size={14} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 min-w-0 text-[15.5px] font-semibold text-ink truncate">{habitDisplayName(hb, t)}</span>
                  <span className="flex-shrink-0" style={{ color: hb.color }}><Icon name={hb.icon} size={20} strokeWidth={2.4} /></span>
                </button>
              );
            })
          )}
        </div>

        {/* Water drops tracker — tap a drop to set your intake */}
        <div className="rounded-card bg-card shadow-card px-4 py-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <Link to="/acqua" className="text-[14px] font-semibold text-ink">{t('nav.water')}</Link>
            <span className="text-[13px] text-ink-3 tnum">{fmtL(ml / 1000)} / {fmtL(goalMl / 1000)}</span>
          </div>
          <div className="flex justify-between gap-1">
            {Array.from({ length: dropTotal }, (_, i) => {
              const f = i < dropDone;
              return (
                <button
                  key={i}
                  aria-label={`${i + 1}`}
                  onClick={() => { platform.haptic(); void setWaterMl(today, (f && i + 1 === dropDone ? i : i + 1) * glassMl); }}
                  className="active:scale-90 transition-transform"
                >
                  <Drop filled={f} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A single teardrop water-glass with a teal gradient when filled, matching the render. */
function Drop({ filled }: { filled: boolean }) {
  return (
    <svg width="28" height="35" viewBox="0 0 24 30" aria-hidden>
      <defs>
        <linearGradient id="wdropG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A7D2EC" />
          <stop offset="100%" stopColor="#6BA8D6" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 C12 2 20 13 20 18 A8 8 0 0 1 4 18 C4 13 12 2 12 2 Z"
        fill={filled ? 'url(#wdropG)' : 'var(--c-section)'}
        stroke={filled ? '#6BA8D6' : 'transparent'}
        strokeWidth="1"
      />
    </svg>
  );
}

function HeroTile({ to, icon, label, sub }: { to: string; icon: string; label: string; sub: string }) {
  return (
    <Link to={to} className="rounded-card bg-card shadow-card px-2 py-4 flex flex-col items-center text-center gap-1 active:scale-[0.97] transition-transform">
      <img src={icon} className="h-11 w-11 object-contain" alt="" aria-hidden draggable={false} />
      <span className="text-[14.5px] font-bold text-ink leading-tight mt-1">{label}</span>
      <span className="text-[12px] text-ink-3 truncate max-w-full">{sub}</span>
    </Link>
  );
}
