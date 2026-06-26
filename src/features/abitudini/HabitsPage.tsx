import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Check, TrendingUp, ChevronRight } from 'lucide-react';
import { db } from '@/data/db';
import { toggleHabitLog, createHabit, readSettings } from '@/data/repo';
import { Icon, useToast } from '@/ui';
import { longDate, todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { HabitForm } from './HabitForm';
import { recommendedForGoal, habitDisplayName } from './recommended';
import { currentStreak, isDone, isScheduled } from './logic';
import type { Habit } from '@/data/types';
import { useT } from '@/i18n';
import { Link } from 'react-router-dom';
import { DayPlanCard } from '@/features/plan/DayPlanCard';
import vioPlant from '/vio/vio-celebrate.png';
import vLogo from '/vyta-vmark.png';

export function HabitsPage() {
  const t = useT();
  const toast = useToast();
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const today = todayISO();

  const active = (habits ?? []).filter((h) => !h.archived);
  const todays = active.filter((h) => isScheduled(h, today));
  const completedToday = todays.filter((h) => isDone(logs ?? [], h.id, today)).length;

  const hr = new Date().getHours();
  const greet = t(hr < 12 ? 'greet.morning' : hr < 18 ? 'greet.afternoon' : 'greet.evening');
  const greeting = settings?.name ? `${greet}, ${settings.name}` : greet;

  const existingRecIds = new Set(active.map((h) => h.recId).filter(Boolean));
  const existingNames = new Set(active.map((h) => habitDisplayName(h, t)));
  const suggestions = recommendedForGoal(settings?.goal).filter((r) => !existingRecIds.has(r.id) && !existingNames.has(t(r.labelKey)));
  async function addSuggested(rec: (typeof suggestions)[number]) {
    platform.haptic();
    await createHabit({ name: t(rec.labelKey), recId: rec.id, color: rec.color, icon: rec.icon, frequency: rec.frequency });
    toast.show(t('home.habitAdded'));
  }

  function openNew() { setEditing(null); setFormOpen(true); }

  return (
    <div className="min-h-[100dvh] bg-app relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[300px]" style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 45%, transparent), transparent 70%)' }} />
      <div className="relative max-w-2xl mx-auto px-5 pt-safe-top pb-[calc(116px+env(safe-area-inset-bottom))] animate-rise">
        {/* Header */}
        <header className="pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-ink-3 capitalize leading-none">{longDate()}</p>
              <h2 className="display-serif text-[22px] text-ink leading-tight mt-1.5 truncate">{greeting}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-shrink-0">
              <Link to="/altro" aria-label={t('nav.more')} className="h-10 w-10 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'color-mix(in srgb, var(--c-habit) 14%, var(--c-card))' }}>
                <img src={vLogo} className="h-6 w-6 object-contain" alt="Vyta" draggable={false} />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="display-serif text-[30px] text-ink leading-tight">{t('habits.title')}</h1>
            <img src={vLogo} className="h-6 w-6 object-contain opacity-90" alt="" aria-hidden draggable={false} />
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-card bg-card shadow-card p-4">
            <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-3">
              <Check size={14} className="text-habit" strokeWidth={3} /> {t('habits.doneToday')}
            </div>
            <div className="mt-2 leading-none">
              <span className="text-[30px] font-extrabold text-ink tnum">{completedToday}</span>
              <span className="text-[18px] font-bold text-ink-3"> / {todays.length}</span>
            </div>
            <div className="text-[12.5px] text-ink-3 mt-1.5">{t('habits.completed')}</div>
          </div>
          <div className="rounded-card bg-card shadow-card p-4">
            <div className="text-[12.5px] font-semibold text-ink-3">{t('habits.totalHabits')}</div>
            <div className="mt-2 text-[30px] font-extrabold text-ink tnum leading-none">{active.length}</div>
            <div className="text-[12.5px] text-ink-3 mt-1.5">{t('habits.activeCount')}</div>
          </div>
        </div>

        {/* Progress */}
        <Link to="/progressi" className="mt-3 rounded-card bg-card shadow-card px-4 py-3.5 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2 text-[14.5px] font-semibold text-ink"><TrendingUp size={18} className="text-habit" /> {t('progress.title')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>

        {/* Plan your day */}
        <DayPlanCard />

        {/* New habit */}
        <button
          onClick={openNew}
          className="w-full mt-3 h-[52px] rounded-2xl text-on-primary font-bold text-[15.5px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-glow-strong"
          style={{ background: 'linear-gradient(180deg, #125A3B, #0B3925)' }}
        >
          <Plus size={20} strokeWidth={2.6} /> {t('habits.newHabit')}
        </button>

        {/* Today */}
        <div className="flex items-center justify-between mt-6 mb-2.5 relative">
          <h2 className="display-serif text-[22px] text-ink">{t('nav.today')}</h2>
          <img src={vioPlant} alt="" aria-hidden draggable={false} className="vio-bob absolute -top-6 right-0 w-20 h-20 object-contain pointer-events-none" />
        </div>

        {todays.length === 0 ? (
          <div className="rounded-card bg-card shadow-card p-6 text-center">
            <p className="text-[15px] font-semibold text-ink">{t('habits.empty.title')}</p>
            <p className="text-[13px] text-ink-2 mt-1">{t('habits.empty.desc')}</p>
            <button onClick={openNew} className="mt-4 h-11 px-5 rounded-full bg-primary text-on-primary font-bold text-[14px]">{t('habits.empty.cta')}</button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todays.map((hb) => {
              const done = isDone(logs ?? [], hb.id, today);
              const streak = currentStreak(hb, logs ?? []);
              return (
                <div key={hb.id} className="rounded-2xl bg-card shadow-card p-2.5 flex items-center gap-3">
                  <button onClick={() => { setEditing(hb); setFormOpen(true); }} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <span className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${hb.color} 16%, transparent)`, color: hb.color }}>
                      <Icon name={hb.icon} size={20} strokeWidth={2.4} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-bold text-ink truncate">{habitDisplayName(hb, t)}</span>
                      {streak > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[12px] font-bold" style={{ background: 'color-mix(in srgb, var(--c-streak) 16%, transparent)', color: 'var(--c-streak)' }}>
                          {t('habits.streakDays', { n: streak })} 🔥
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => { platform.haptic(); void toggleHabitLog(hb.id, today); }}
                    aria-label={done ? t('habits.checkedToday') : t('habits.checkin')}
                    className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                    style={done ? { background: '#4F9D55', borderColor: '#4F9D55' } : { borderColor: 'var(--c-line)' }}
                  >
                    {done && <Check size={18} className="text-white" strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggested */}
        {suggestions.length > 0 && (
          <>
            <h2 className="display-serif text-[20px] text-ink mt-6 mb-2.5">{t('habits.suggested')}</h2>
            <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
              {suggestions.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => addSuggested(rec)}
                  className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-3.5 h-10 text-[13.5px] font-bold bg-card shadow-card active:scale-95 transition-transform flex-shrink-0 whitespace-nowrap"
                  style={{ color: rec.color }}
                >
                  <Icon name={rec.icon} size={16} strokeWidth={2.5} /> {t(rec.labelKey)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <HabitForm open={formOpen} onClose={() => setFormOpen(false)} habit={editing} />
    </div>
  );
}
