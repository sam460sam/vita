import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings2, Check } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings, toggleHabitLog } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { ProgressRing, VioCompanion, Icon } from '@/ui';
import { cn } from '@/lib/cn';
import { longDate, todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { isScheduled, isDone, currentStreak } from '@/features/abitudini/logic';
import { habitDisplayName } from '@/features/abitudini/recommended';
import { computeMomentum, momentumMessageKey } from './momentum';
import { useT, type TKey } from '@/i18n';
import iconHabits from '/icons3d/habits.png';
import iconWater from '/icons3d/water.png';
import iconCompass from '/icons3d/compass.png';

const WATER = '#0EA5E9';

/** Home — premium "Today" screen: greeting · Momentum + Vio · hero tiles · today's habits · water. */
export function HomeScreen() {
  const t = useT();
  const navigate = useNavigate();
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

  const goalMl = s.water.dailyGoalMl || 2000;
  const ml = todayWater?.ml ?? 0;
  const waterPct = Math.min(1, ml / goalMl);
  const fmtL = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')} L`;

  return (
    <div className="min-h-[100dvh] bg-app relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[340px]" style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 55%, transparent), transparent 70%)' }} />
      <div className="relative max-w-2xl mx-auto px-4 pt-safe-top pb-[calc(116px+env(safe-area-inset-bottom))] animate-rise">
        {/* Greeting header */}
        <header className="flex items-center gap-3 pt-4 pb-2">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-ink-3 capitalize leading-none">{longDate()}</p>
            <h1 className="display-serif text-[28px] text-ink leading-tight truncate mt-1">{greeting}</h1>
          </div>
          <button onClick={() => navigate('/cerca')} aria-label={t('search.title')} className="h-10 w-10 rounded-full bg-card shadow-chip flex items-center justify-center text-ink-2 active:scale-90 transition-transform"><Search size={18} /></button>
          <button onClick={() => navigate('/impostazioni')} aria-label={t('nav.settings')} className="h-10 w-10 rounded-full bg-card shadow-chip flex items-center justify-center text-ink-2 active:scale-90 transition-transform"><Settings2 size={18} /></button>
        </header>

        {/* Momentum + Vio */}
        <Link to="/recap" className="block">
          <div className="relative rounded-card bg-card shadow-card p-5 overflow-hidden active:bg-section transition-colors">
            <div className="flex items-center gap-4 pr-24">
              <ProgressRing progress={m.score / 100} size={92} stroke={9} gradient={['#86C45A', '#1E8E4E']}>
                <div className="text-center leading-none">
                  <div className="text-[26px] font-extrabold text-ink tnum">{m.score}</div>
                  <div className="text-[11px] font-bold text-ink-3">/100</div>
                </div>
              </ProgressRing>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-ink-2">{t('momentum.title')}</div>
                <p className="text-[14px] text-ink-2 leading-snug mt-1">{t(momentumMessageKey(m.score) as TKey)}</p>
              </div>
            </div>
            <VioCompanion score={m.score} size={108} animated className="absolute -right-2 -bottom-3" />
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
        <div className="rounded-card bg-card shadow-card divide-y divide-divider overflow-hidden">
          {todays.length === 0 ? (
            <div className="p-5 text-center text-[14px] text-ink-2">{t('home.routine.empty.desc')}</div>
          ) : (
            todays.slice(0, 5).map((hb) => {
              const done = isDone(logs ?? [], hb.id, today);
              const streak = currentStreak(hb, logs ?? []);
              return (
                <button key={hb.id} onClick={() => { platform.haptic(); void toggleHabitLog(hb.id, today); }} className="flex items-center gap-3 w-full px-4 py-3 active:bg-section transition-colors text-left">
                  <span className="h-9 w-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${hb.color} 16%, transparent)`, color: hb.color }}>
                    <Icon name={hb.icon} size={18} strokeWidth={2.5} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={cn('block text-[15px] font-semibold truncate', done ? 'text-ink-3 line-through' : 'text-ink')}>{habitDisplayName(hb, t)}</span>
                    {streak > 0 && <span className="block text-[12px] text-ink-3">{t('home.routine.streak', { n: streak })}</span>}
                  </span>
                  <span className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors" style={done ? { background: hb.color, borderColor: hb.color } : { borderColor: 'var(--c-line)' }}>
                    {done && <Check size={16} className="text-white" strokeWidth={3} />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Water tracker */}
        <Link to="/acqua" className="block mt-4">
          <div className="rounded-card bg-card shadow-card p-4 flex items-center gap-3 active:bg-section transition-colors">
            <img src={iconWater} className="h-10 w-10 object-contain flex-shrink-0" alt="" aria-hidden draggable={false} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-ink">{t('nav.water')}</span>
                <span className="text-[13px] text-ink-3 tnum">{fmtL(ml / 1000)} / {fmtL(goalMl / 1000)}</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-section overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${waterPct * 100}%`, background: WATER }} />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function HeroTile({ to, icon, label, sub }: { to: string; icon: string; label: string; sub: string }) {
  return (
    <Link to={to} className="rounded-card bg-card shadow-card p-3.5 flex flex-col gap-1 active:scale-[0.97] transition-transform">
      <img src={icon} className="h-11 w-11 object-contain -mt-1" alt="" aria-hidden draggable={false} />
      <span className="text-[14px] font-bold text-ink leading-tight mt-0.5">{label}</span>
      <span className="text-[12px] text-ink-3 truncate">{sub}</span>
    </Link>
  );
}
