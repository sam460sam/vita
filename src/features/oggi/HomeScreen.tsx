import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { startOfWeek, addDays, subDays, format } from 'date-fns';
import { Check, ChevronRight } from 'lucide-react';
import { db } from '@/data/db';
import {
  readSettings, addWaterMl, readDayPlan, setDayIntention, toggleDayIntentionDone,
} from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { ProgressRing, VioCompanion } from '@/ui';
import { useIsPro } from '@/premium/premium';
import { longDate, todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { syncWidgetData, drainWidgetWaterInbox } from '@/platform/widget';
import { isScheduled, isDone, currentStreak } from '@/features/abitudini/logic';
import { habitDisplayName } from '@/features/abitudini/recommended';
import { UpdateNudge } from '@/features/update/UpdateNudge';
import { DailyInspiration } from '@/features/luxe/DailyInspiration';
import { ProNudge } from '@/features/pro/ProNudge';
import { computeMomentum, momentumMessageKey, type MomentumKey } from './momentum';
import { useT, type TKey } from '@/i18n';
import { ThemeToggle } from './ThemeToggle';
import type { Habit } from '@/data/types';
import vLogo from '/vyta-vmark.png';

const BREAKDOWN_EMOJI: Record<MomentumKey, string> = {
  habit: '🌿', focus: '🎯', todo: '✅', workout: '🏋️', journal: '📓', water: '💧',
};

/** Home — a calm daily overview: focus → progress → plant → saved items.
 *  Habits and Workout have their own tabs; Home just shows the big picture. */
export function HomeScreen() {
  const t = useT();
  const isPro = useIsPro();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const todayWater = useLiveQuery(() => db.waterLogs.get(todayISO()), [], undefined);
  const today = todayISO();
  const dayPlan = useLiveQuery(() => readDayPlan(today), [today], undefined);
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('createdAt').reverse().toArray(), [], []);

  const s = settings ?? defaultSettings();
  const m = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], todayWater, journals ?? [], { dayPlan, sessions: sessions ?? [] });

  const hr = new Date().getHours();
  const greet = t(hr < 12 ? 'greet.morning' : hr < 18 ? 'greet.afternoon' : 'greet.evening');
  const greeting = s.name ? `${greet}, ${s.name}` : greet;
  const vioMood = m.score >= 67 ? 'happy' : m.score >= 34 ? 'waiting' : 'sleepy';

  const active = (habits ?? []).filter((x) => !x.archived);
  const todays = active.filter((x) => isScheduled(x, today));
  const habitsDone = todays.filter((x) => isDone(logs ?? [], x.id, today)).length;
  const maxStreak = active.reduce((mx, h) => Math.max(mx, currentStreak(h, logs ?? [])), 0);

  const goalMl = s.water.dailyGoalMl || 2000;
  const ml = todayWater?.ml ?? 0;
  const glassMl = s.water.glassMl || 250;
  const fmtL = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')} L`;

  // Today's focus (one important thing) — kept in local state, committed on blur.
  const [focusText, setFocusText] = useState('');
  useEffect(() => { if (dayPlan) setFocusText(dayPlan.intention); }, [dayPlan?.intention]);
  const focusSet = !!dayPlan?.intention.trim();
  const focusDone = !!dayPlan?.intentionDone;

  // The plant does a happy little bounce whenever Momentum grows (a completion).
  const prevScore = useRef(m.score);
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (m.score > prevScore.current) {
      setCelebrate(true);
      const id = setTimeout(() => setCelebrate(false), 650);
      prevScore.current = m.score;
      return () => clearTimeout(id);
    }
    prevScore.current = m.score;
  }, [m.score]);

  useEffect(() => { if (isPro) void drainWidgetWaterInbox((delta) => addWaterMl(today, delta)); }, [today, isPro]);

  // Mirror today's data into the App Group so the widgets stay fresh.
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
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px]" style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 45%, transparent), transparent 70%)' }} />
      <div className="relative max-w-2xl mx-auto px-5 pt-safe-top pb-[calc(116px+env(safe-area-inset-bottom))] animate-rise">
        {/* Greeting header */}
        <header className="flex items-start justify-between gap-3 pt-5 pb-4">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-ink-3 capitalize leading-none">{longDate()}</p>
            <h1 className="display-serif text-[28px] text-ink leading-tight mt-1.5 truncate">{greeting}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <ThemeToggle />
            <Link to="/altro" aria-label={t('nav.more')} className="h-10 w-10 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'color-mix(in srgb, var(--c-habit) 14%, var(--c-card))' }}>
              <img src={vLogo} className="h-6 w-6 object-contain" alt="Vyta" draggable={false} />
            </Link>
          </div>
        </header>

        <UpdateNudge />

        {/* 1 — Today's focus */}
        <div data-tour="focus" className="rounded-card bg-card shadow-card px-4 py-4">
          <div className="text-[12px] font-bold text-ink-3 uppercase tracking-wide mb-2 flex items-center gap-1.5"><span aria-hidden>🎯</span> {t('home.focus.label')}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (focusSet) { platform.haptic(); void toggleDayIntentionDone(today); } }}
              aria-label={t('home.focus.label')}
              className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
              style={focusDone ? { background: '#4F9D55', borderColor: '#4F9D55' } : { borderColor: 'var(--c-line)' }}
            >
              {focusDone && <Check size={16} className="text-white check-pop" strokeWidth={3} />}
            </button>
            <input
              value={focusText}
              onChange={(e) => setFocusText(e.target.value)}
              onBlur={() => { if (focusText !== (dayPlan?.intention ?? '')) void setDayIntention(today, focusText); }}
              placeholder={t('plan.intentionPlaceholder')}
              className={`flex-1 min-w-0 bg-transparent text-[16px] outline-none ${focusDone ? 'line-through text-ink-3' : 'text-ink'}`}
            />
          </div>
        </div>

        {/* Progress strip: even, fully-visible stat tiles (Momentum lives in the big card below) */}
        <div data-tour="chips" className={`grid gap-2 mt-4 ${isPro ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <Link to="/abitudini" className="block"><Chip emoji="🌿" label={t('nav.habits')} value={`${habitsDone}/${todays.length}`} /></Link>
          {isPro && <Link to="/acqua" className="block"><Chip emoji="💧" label={t('nav.water')} value={`${fmtL(ml / 1000)} / ${fmtL(goalMl / 1000)}`} /></Link>}
          <Link to="/progressi" className="block"><Chip emoji="🔥" label={t('home.streak')} value={`${maxStreak}`} /></Link>
        </div>

        {/* 5 — Your plant (Momentum reward) */}
        <Link to="/recap" data-tour="momentum" className="block mt-3">
          <div className="rounded-card bg-card px-4 py-4 active:bg-section transition-colors flex items-center gap-3" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(184,134,11,0.18), 0 0 30px rgba(13,77,50,0.22), 0 12px 28px rgba(0,0,0,0.5)' }}>
            <div className="relative flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(13,77,50,0.6))' }}>
              <ProgressRing progress={m.score / 100} size={72} stroke={8} gradient={['#3DA66F', '#0D4D32']}>
                <span className="text-[18px] font-extrabold text-ink tnum leading-none">{m.score}</span>
              </ProgressRing>
            </div>
            <div className={`flex-shrink-0 ${celebrate ? 'vio-pop' : m.score >= 60 ? 'vio-breathe' : ''}`}>
              <VioCompanion score={m.score} mood={vioMood} size={68} animated />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold text-ink">Momentum</div>
              {m.breakdown.length > 0 ? (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[12.5px] font-bold" style={{ color: 'var(--c-habit)' }}>{t('home.todayPlus', { n: m.points })}</span>
                  {m.breakdown.map((p) => (
                    <span key={p.key} className="text-[12px] text-ink-3">{BREAKDOWN_EMOJI[p.key]}{p.n > 1 ? `×${p.n}` : ''}</span>
                  ))}
                </div>
              ) : (
                <div className="text-[12.5px] text-ink-3 mt-1 leading-snug line-clamp-2">{t('home.momentum.empty')}</div>
              )}
            </div>
            <ChevronRight size={18} className="text-ink-3 flex-shrink-0" />
          </div>
        </Link>

        {/* Saved items — one place, split by category (each opens its by-day list). */}
        <h2 className="display-serif text-[21px] text-ink mt-6 mb-2.5">{t('home.saved.title')}</h2>
        <div data-tour="saved" className="grid grid-cols-3 gap-3">
          <SavedTile to="/allenamento" emoji="🏋️" color="#d98a6a" label={t('workout.title')} />
          <SavedTile to="/diario" emoji="📓" color="var(--c-journal)" label={t('nav.journal')} />
          <SavedTile to="/note" emoji="📝" color="#cdb079" label={t('nav.notes')} />
        </div>

        {/* Gentle Pro nudge (free users only, snoozes after dismiss) */}
        <ProNudge className="mt-6" />

        {/* 6 — Daily inspiration */}
        <DailyInspiration className="mt-6" />
      </div>
    </div>
  );
}

function SavedTile({ to, emoji, color, label }: { to: string; emoji: string; color: string; label: string }) {
  return (
    <Link to={to} className="rounded-card bg-card shadow-card px-2 py-4 flex flex-col items-center text-center gap-2 active:scale-[0.97] transition-transform">
      <span className="h-11 w-11 rounded-2xl flex items-center justify-center text-[22px]" style={{ background: `color-mix(in srgb, ${color} 16%, var(--c-card))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)` }} aria-hidden>{emoji}</span>
      <span className="text-[13px] font-bold text-ink leading-tight">{label}</span>
    </Link>
  );
}

function Chip({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <span className="flex flex-col items-center justify-center gap-0.5 w-full rounded-card bg-card shadow-chip px-1.5 py-2 text-center">
      <span className="inline-flex items-center gap-1 leading-none">
        <span aria-hidden className="text-[14px]">{emoji}</span>
        <span className="font-bold text-ink tnum text-[14px] whitespace-nowrap">{value}</span>
      </span>
      <span className="text-ink-3 text-[11px] font-semibold truncate max-w-full">{label}</span>
    </span>
  );
}
