import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Plus, ChevronRight, BarChart3, Trash2, Check } from 'lucide-react';
import { startOfWeek, addDays, format } from 'date-fns';
import { db } from '@/data/db';
import { toggleHabitLog, deleteHabit, createHabit, readSettings } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { EmptyState, Button, Icon, useToast } from '@/ui';
import { todayISO, activeDfnLocale } from '@/lib/format';
import { platform } from '@/platform/platform';
import { HabitForm } from './HabitForm';
import { Heatmap } from './Heatmap';
import { recommendedForGoal, habitDisplayName } from './recommended';
import { currentStreak, heatmapData, isDone } from './logic';
import type { Habit } from '@/data/types';
import { useT } from '@/i18n';

/** Which weekdays (0=Sun..6=Sat) a habit is scheduled on. */
function scheduledOn(h: Habit, dow: number): boolean {
  if (h.frequency.type === 'specific_days') return h.frequency.days?.includes(dow) ?? false;
  return true; // daily + times_per_week → any day
}

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
  const completedToday = active.filter((h) => isDone(logs ?? [], h.id, today)).length;

  // Recommended habits the user hasn't added yet (match by recId, else name).
  const existingRecIds = new Set(active.map((h) => h.recId).filter(Boolean));
  const existingNames = new Set(active.map((h) => habitDisplayName(h, t)));
  const suggestions = recommendedForGoal(settings?.goal).filter((r) => !existingRecIds.has(r.id) && !existingNames.has(t(r.labelKey)));
  async function addSuggested(rec: (typeof suggestions)[number]) {
    platform.haptic();
    await createHabit({ name: t(rec.labelKey), recId: rec.id, color: rec.color, icon: rec.icon, frequency: rec.frequency });
    toast.show(t('home.habitAdded'));
  }

  // Localised 2-letter weekday labels, Sunday-first (Su Mo Tu We Th Fr Sa).
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekdays = Array.from({ length: 7 }, (_, i) => ({ dow: i, label: format(addDays(weekStart, i), 'EEEEEE', { locale: activeDfnLocale() }) }));

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  async function remove(h: Habit) {
    if (confirm(t('habits.deleteConfirm', { name: habitDisplayName(h, t) }))) await deleteHabit(h.id);
  }

  return (
    <>
      <PageHeader title={t('habits.title')} />
      <Screen>
        {/* Stats hero */}
        <div className="rounded-card shadow-card p-5 mb-3 relative overflow-hidden" style={{ background: 'linear-gradient(140deg, color-mix(in srgb, var(--c-habit) 20%, var(--c-card)), var(--c-card) 78%)' }}>
          <h2 className="text-[22px] font-extrabold text-ink tracking-tight">{t('habits.title')}</h2>
          <p className="text-[13px] text-ink-2 mt-0.5">{t('habits.subtitle')}</p>
          <div className="flex gap-8 mt-4">
            <div>
              <div className="text-[26px] font-extrabold tnum text-ink leading-none">{active.length}</div>
              <div className="text-[12px] font-semibold text-ink-3 mt-1">{t('habits.totalHabits')}</div>
            </div>
            <div>
              <div className="text-[26px] font-extrabold tnum leading-none" style={{ color: 'var(--c-habit)' }}>{completedToday}</div>
              <div className="text-[12px] font-semibold text-ink-3 mt-1">{t('habits.completedToday')}</div>
            </div>
          </div>
          <Flame size={96} className="absolute -right-3 -bottom-5 opacity-[0.09] text-habit" />
        </div>

        {/* Create new habit */}
        <button
          onClick={openNew}
          className="w-full bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-3.5 mb-3 flex items-center gap-3 active:scale-[0.99] transition-transform"
        >
          <span className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'var(--c-habit)' }}>
            <Plus size={20} />
          </span>
          <span className="flex-1 text-left text-[15px] font-bold text-ink">{t('habits.createNew')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </button>

        {/* Suggested habits — one tap to add */}
        {suggestions.length > 0 && (
          <div className="bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-4 mb-3">
            <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-ink-3 mb-2.5">{t('habits.suggested')}</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => addSuggested(rec)}
                  className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-3 h-9 text-[13px] font-bold active:scale-95 transition-transform"
                  style={{ background: `color-mix(in srgb, ${rec.color} 14%, transparent)`, color: rec.color }}
                >
                  <Icon name={rec.icon} size={15} strokeWidth={2.5} /> {t(rec.labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {active.length === 0 ? (
          <div className="bg-card rounded-card shadow-card border border-line/40 dark:border-transparent">
            <EmptyState
              mascot
              title={t('habits.empty.title')}
              description={t('habits.empty.desc')}
              action={<Button onClick={openNew}>{t('habits.empty.cta')}</Button>}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((h) => {
              const done = isDone(logs ?? [], h.id, today);
              const streak = currentStreak(h, logs ?? []);
              return (
                <div key={h.id} className="bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-3.5">
                  <div className="flex gap-3.5">
                    {/* Heatmap (last 7 weeks) */}
                    <div className="flex-shrink-0">
                      <Heatmap cells={heatmapData(h, logs ?? [], 49)} color={h.color} />
                    </div>

                    {/* Right column */}
                    <div className="min-w-0 flex-1 flex flex-col">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1 flex items-center gap-1.5">
                          <span style={{ color: h.color }} className="flex-shrink-0">
                            <Icon name={h.icon} size={16} strokeWidth={2.5} />
                          </span>
                          <span className="text-[15px] font-bold text-ink truncate">{habitDisplayName(h, t)}</span>
                          {streak > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-streak flex-shrink-0">
                              <Flame size={11} />{streak}
                            </span>
                          )}
                        </div>
                        <button onClick={() => { setEditing(h); setFormOpen(true); }} aria-label={t('common.edit')} className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${h.color} 14%, transparent)`, color: h.color }}>
                          <BarChart3 size={14} />
                        </button>
                        <button onClick={() => remove(h)} aria-label={t('common.delete')} className="h-7 w-7 rounded-full bg-danger/10 text-danger flex items-center justify-center flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Weekday circles */}
                      <div className="flex gap-1 mt-2">
                        {weekdays.map((w) => {
                          const on = scheduledOn(h, w.dow);
                          return (
                            <span
                              key={w.dow}
                              className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold capitalize"
                              style={on ? { background: `color-mix(in srgb, ${h.color} 18%, transparent)`, color: h.color } : { background: 'var(--c-section)', color: 'var(--c-ink-3)' }}
                            >
                              {w.label}
                            </span>
                          );
                        })}
                      </div>

                      {/* Check in */}
                      <button
                        onClick={() => { platform.haptic(); void toggleHabitLog(h.id, today); }}
                        className="mt-3 h-10 rounded-full flex items-center justify-center gap-1.5 text-[14px] font-bold transition-colors"
                        style={done
                          ? { background: `color-mix(in srgb, ${h.color} 16%, transparent)`, color: h.color }
                          : { background: h.color, color: '#fff' }}
                      >
                        {done ? <><Check size={16} strokeWidth={3} /> {t('habits.checkedToday')}</> : <><Plus size={16} /> {t('habits.checkin')}</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Screen>

      <HabitForm open={formOpen} onClose={() => setFormOpen(false)} habit={editing} />
    </>
  );
}
