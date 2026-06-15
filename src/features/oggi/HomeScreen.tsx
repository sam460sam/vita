import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Check, Droplet } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings, toggleHabitLog } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { ProgressRing, VioCompanion } from '@/ui';
import { cn } from '@/lib/cn';
import { longDate, todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { isScheduled, isDone } from '@/features/abitudini/logic';
import { habitDisplayName } from '@/features/abitudini/recommended';
import { computeMomentum, momentumMessageKey } from './momentum';
import { useT, type TKey } from '@/i18n';
import iconHabits from '/icons3d/habits.png';
import iconWater from '/icons3d/water.png';
import iconCompass from '/icons3d/compass.png';

const WATER = '#0EA5E9';

/** Home — premium "Today" screen, faithful to the design north-star. */
export function HomeScreen() {
  const t = useT();
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

  const active = (habits ?? []).filter((x) => !x.archived);
  const todays = active.filter((x) => isScheduled(x, today));
  const pending = todays.filter((x) => !isDone(logs ?? [], x.id, today));

  const glassMl = s.water.glassMl || 250;
  const goalMl = s.water.dailyGoalMl || 2000;
  const ml = todayWater?.ml ?? 0;
  const fmtL = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')} L`;
  const dropTotal = Math.min(10, Math.max(6, Math.round(goalMl / glassMl)));
  const dropDone = Math.min(dropTotal, Math.round(ml / glassMl));

  return (
    <div className="min-h-[100dvh] bg-app relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[320px]" style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 50%, transparent), transparent 70%)' }} />
      <div className="relative max-w-2xl mx-auto px-5 pt-safe-top pb-[calc(116px+env(safe-area-inset-bottom))] animate-rise">
        {/* Greeting header */}
        <header className="pt-5 pb-3">
          <p className="text-[12.5px] font-semibold text-ink-3 capitalize leading-none">{longDate()}</p>
          <h1 className="display-serif text-[30px] text-ink leading-tight mt-1.5">{greeting}</h1>
        </header>

        {/* Momentum + Vio */}
        <Link to="/recap" className="block">
          <div className="relative rounded-[26px] bg-card shadow-card px-5 py-4 overflow-hidden active:bg-section transition-colors">
            <h2 className="display-serif text-[21px] text-ink">Momentum</h2>
            <div className="flex items-center gap-4 mt-2 pr-24">
              <ProgressRing progress={m.score / 100} size={96} stroke={11} gradient={['#86C45A', '#1E8E4E']}>
                <div className="flex items-baseline">
                  <span className="text-[24px] font-extrabold text-ink tnum leading-none">{m.score}</span>
                  <span className="text-[13px] font-bold text-ink-3"> / 100</span>
                </div>
              </ProgressRing>
            </div>
            <p className="text-[14px] text-ink-2 leading-snug mt-3">{t(momentumMessageKey(m.score) as TKey)}</p>
            <VioCompanion score={m.score} size={120} animated className="absolute right-1 top-1/2 -translate-y-1/2" />
          </div>
        </Link>

        {/* Hero tiles */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <HeroTile to="/abitudini" icon={iconHabits} label={t('nav.habits')} sub={t('home.tile.todo', { n: pending.length })} />
          <HeroTile to="/acqua" icon={iconWater} label={t('nav.water')} sub={`${fmtL(ml / 1000)} / ${fmtL(goalMl / 1000)}`} />
          <HeroTile to="/personalita" icon={iconCompass} label={t('nav.personality.short')} sub={t('home.tile.ready')} />
        </div>

        {/* Today's habits */}
        <div className="flex items-center justify-between mt-6 mb-2.5">
          <h2 className="display-serif text-[22px] text-ink">{t('nav.today')}</h2>
          <Link to="/abitudini" className="text-[13px] font-semibold text-habit">{t('home.routine.all')}</Link>
        </div>
        <div className="rounded-[26px] bg-card shadow-card p-2">
          {todays.length === 0 ? (
            <div className="p-4 text-center text-[14px] text-ink-2">{t('home.routine.empty.desc')}</div>
          ) : (
            todays.slice(0, 5).map((hb) => {
              const done = isDone(logs ?? [], hb.id, today);
              return (
                <button
                  key={hb.id}
                  onClick={() => { platform.haptic(); void toggleHabitLog(hb.id, today); }}
                  className={cn('flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-left transition-colors', done ? 'bg-habit/12' : 'active:bg-section')}
                >
                  <span
                    className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                    style={done ? { background: 'var(--c-habit)', borderColor: 'var(--c-habit)' } : { borderColor: 'var(--c-line)' }}
                  >
                    {done && <Check size={15} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 min-w-0 text-[15.5px] font-semibold text-ink truncate">{habitDisplayName(hb, t)}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Water drops tracker */}
        <Link to="/acqua" className="block mt-4">
          <div className="rounded-[26px] bg-card shadow-card px-4 py-4 active:bg-section transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-ink">{t('nav.water')}</span>
              <span className="text-[13px] text-ink-3 tnum">{fmtL(ml / 1000)} / {fmtL(goalMl / 1000)}</span>
            </div>
            <div className="flex justify-between gap-1">
              {Array.from({ length: dropTotal }, (_, i) => (
                <Droplet
                  key={i}
                  size={28}
                  strokeWidth={1.5}
                  style={{ color: i < dropDone ? WATER : 'var(--c-line)' }}
                  fill={i < dropDone ? WATER : 'var(--c-section)'}
                  className="flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function HeroTile({ to, icon, label, sub }: { to: string; icon: string; label: string; sub: string }) {
  return (
    <Link to={to} className="rounded-[22px] bg-card shadow-card px-2 py-4 flex flex-col items-center text-center gap-1 active:scale-[0.97] transition-transform">
      <img src={icon} className="h-11 w-11 object-contain" alt="" aria-hidden draggable={false} />
      <span className="text-[14.5px] font-bold text-ink leading-tight mt-1">{label}</span>
      <span className="text-[12px] text-ink-3 truncate max-w-full">{sub}</span>
    </Link>
  );
}
