import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { startOfWeek, addDays, subDays, format } from 'date-fns';
import { Check, ChevronRight } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings, toggleHabitLog, addWaterMl } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { ProgressRing, VioCompanion, Icon } from '@/ui';
import { longDate, todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { syncWidgetData, drainWidgetWaterInbox } from '@/platform/widget';
import { isScheduled, isDone } from '@/features/abitudini/logic';
import { habitDisplayName } from '@/features/abitudini/recommended';
import { UpdateNudge } from '@/features/update/UpdateNudge';
import { GoalsQuiz } from '@/features/plan/GoalsQuiz';
import { DailyInspiration } from '@/features/luxe/DailyInspiration';
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
          <div className="flex items-center gap-2 mt-1.5 flex-shrink-0">
            <Link to="/altro" aria-label={t('nav.more')} className="h-10 w-10 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'color-mix(in srgb, var(--c-habit) 14%, var(--c-card))' }}>
              <img src={vLogo} className="h-6 w-6 object-contain" alt="Vyta" draggable={false} />
            </Link>
          </div>
        </header>

        {/* Update available (App Store has a newer version) */}
        <UpdateNudge />

        {/* Momentum + Vio */}
        <Link to="/recap" className="block">
          <div className="rounded-card bg-card px-6 py-6 active:bg-section transition-colors" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(184,134,11,0.20), 0 0 44px rgba(13,77,50,0.30), 0 18px 40px rgba(0,0,0,0.6)' }}>
            <h2 className="display-serif text-[21px] text-ink tracking-[0.01em]">Momentum</h2>
            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="flex-1 flex justify-center" style={{ filter: 'drop-shadow(0 0 12px rgba(13,77,50,0.65))' }}>
                <ProgressRing progress={m.score / 100} size={132} stroke={14} gradient={['#3DA66F', '#0D4D32']}>
                  <div className="flex items-baseline">
                    <span className="text-[32px] font-extrabold text-ink tnum leading-none">{m.score}</span>
                    <span className="text-[14px] font-bold text-ink-3"> / 100</span>
                  </div>
                </ProgressRing>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative flex items-center justify-center" style={{ width: 138, height: 138 }}>
                  {/* Luminous terrarium: a soft emerald radial bloom tracking Momentum. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 50% 56%, rgba(61,166,111,${0.12 + (m.score / 100) * 0.34}) 0%, rgba(13,77,50,${0.10 + (m.score / 100) * 0.20}) 40%, transparent 72%)`,
                      filter: 'blur(7px)',
                    }}
                  />
                  {/* Premium glass-like rim around the terrarium. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute rounded-full"
                    style={{ inset: 6, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1.5px rgba(184,134,11,0.12)' }}
                  />
                  {/* Floating spores when momentum is blooming. */}
                  {m.score >= 60 && (
                    <div aria-hidden className="pointer-events-none absolute inset-0">
                      {[
                        { left: '24%', size: 4, dur: '5.5s', delay: '0s' },
                        { left: '46%', size: 3, dur: '6.5s', delay: '1.4s' },
                        { left: '68%', size: 5, dur: '5s', delay: '0.7s' },
                        { left: '58%', size: 3, dur: '7s', delay: '2.2s' },
                      ].map((p, i) => (
                        <span
                          key={i}
                          className="speck absolute rounded-full"
                          style={{ left: p.left, bottom: '26%', width: p.size, height: p.size, background: 'var(--c-gold-2)', boxShadow: '0 0 6px rgba(184,134,11,0.7)', animationDuration: p.dur, animationDelay: p.delay }}
                        />
                      ))}
                    </div>
                  )}
                  <div className={`relative ${m.score >= 60 ? 'vio-breathe' : ''}`}>
                    <VioCompanion score={m.score} mood={vioMood} size={138} animated />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[14px] text-ink-2 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">{t(momentumMessageKey(m.score) as TKey)}</p>
          </div>
        </Link>

        {/* Hero tiles */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <HeroTile to="/abitudini" icon={iconHabits} label={t('nav.habits')} sub={t('home.tile.todo', { n: pending.length })} />
          <HeroTile to="/acqua" icon={iconWater} label={t('nav.water')} sub={`${fmtL(ml / 1000)} / ${fmtL(goalMl / 1000)}`} />
          <HeroTile to="/personalita" icon={iconCompass} label={t('nav.personality.short')} sub={t('home.tile.ready')} />
        </div>

        {/* Notes & to-dos */}
        <Link to="/agenda" className="rounded-card bg-card shadow-card px-4 py-4 mt-5 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="text-[20px]" aria-hidden>📝</span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-ink">{t('agenda.title')}</span>
              <span className="block text-[12.5px] text-ink-3 truncate">{t('agenda.subtitle')}</span>
            </span>
          </span>
          <ChevronRight size={18} className="text-ink-3 flex-shrink-0" />
        </Link>

        {/* Routines */}
        <Link to="/routine" className="rounded-card bg-card shadow-card px-4 py-4 mt-3.5 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><span className="text-[20px]" aria-hidden>🌿</span> {t('routine.title')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>

        {/* Goals quiz */}
        <button onClick={() => setQuizOpen(true)} className="w-full rounded-card bg-card shadow-card px-4 py-4 mt-3.5 flex items-center justify-between active:bg-section transition-colors text-left">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><span className="text-[20px]" aria-hidden>🎯</span> {t('goalsq.cta')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </button>
        {quizOpen && <GoalsQuiz onClose={() => setQuizOpen(false)} />}

        {/* Today's habits */}
        <div className="flex items-center justify-between mt-7 mb-2.5">
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

        {/* Editorial close */}
        <DailyInspiration className="mt-7" />

      </div>
    </div>
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
