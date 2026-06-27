import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, ChevronRight, Watch, Sparkles, Copy, SlidersHorizontal, TrendingUp, Play, Trash2, BookMarked, Timer, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { db } from '@/data/db';
import { createWorkoutSession, saveWorkoutSession, duplicateWorkoutSession, readSettings, startSessionFromPlan, deleteWorkoutPlan, setRestSec } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Sheet } from '@/ui';
import { activeDfnLocale } from '@/lib/format';
import { useT, useI18n, type TKey } from '@/i18n';
import { EQUIPMENT_LIST } from './exercises';
import { TEMPLATES, templateItems, itemsToEntries } from './generator';
import { GenerateSheet } from './GenerateSheet';
import { EquipmentSheet } from './EquipmentSheet';
import { DailyInspiration } from '@/features/luxe/DailyInspiration';
import type { Equipment } from '@/data/types';

/** Strength-training hub: start / generate / templates / history. */
export function WorkoutPage() {
  const t = useT();
  const { lang } = useI18n();
  const nav = useNavigate();
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('createdAt').reverse().toArray(), [], []);
  const plans = useLiveQuery(() => db.workoutPlans.orderBy('createdAt').reverse().toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const [genOpen, setGenOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);

  const equipment: Equipment[] = settings?.equipment ?? EQUIPMENT_LIST;
  const restSec = settings?.restSec ?? 90;
  const lastFinished = (sessions ?? []).find((s) => s.finishedAt);

  async function start() {
    const s = await createWorkoutSession(t('workout.session.default'));
    nav(`/allenamento/s/${s.id}`);
  }
  async function fromTemplate(tplId: string) {
    const tpl = TEMPLATES.find((x) => x.id === tplId);
    if (!tpl) return;
    const items = templateItems(tpl, equipment);
    const s = await createWorkoutSession(t(tpl.nameKey as TKey));
    await saveWorkoutSession({ ...s, entries: itemsToEntries(items, lang) });
    nav(`/allenamento/s/${s.id}`);
  }
  async function duplicate() {
    if (!lastFinished) return;
    const s = await duplicateWorkoutSession(lastFinished);
    nav(`/allenamento/s/${s.id}`);
  }
  async function fromPlan(planId: string) {
    const plan = (plans ?? []).find((p) => p.id === planId);
    if (!plan) return;
    const s = await startSessionFromPlan(plan);
    nav(`/allenamento/s/${s.id}`);
  }

  return (
    <>
      <PageHeader title={t('workout.title')} />
      <Screen>
        <button data-tour="wo-start" onClick={() => void start()} className="w-full h-[58px] rounded-2xl text-on-primary font-bold text-[16.5px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-glow-strong" style={{ background: 'linear-gradient(180deg, #125A3B, #0B3925)' }}>
          <Dumbbell size={21} /> {t('workout.start')}
        </button>

        <div data-tour="wo-create" className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => setGenOpen(true)} className="rounded-card bg-card shadow-card px-2 py-4 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
            <Sparkles size={22} className="text-habit" />
            <span className="text-[13px] font-bold text-ink text-center leading-tight">{t('workout.generate')}</span>
          </button>
          <button onClick={() => void duplicate()} disabled={!lastFinished} className="rounded-card bg-card shadow-card px-2 py-4 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform disabled:opacity-40">
            <Copy size={22} className="text-activity" />
            <span className="text-[13px] font-bold text-ink text-center leading-tight">{t('workout.duplicate')}</span>
          </button>
        </div>

        {/* Templates */}
        <h2 className="display-serif text-[20px] text-ink mt-6 mb-2.5">{t('workout.templates')}</h2>
        <div data-tour="wo-templates" className="grid grid-cols-3 gap-2.5">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} onClick={() => void fromTemplate(tpl.id)} className="rounded-card bg-card shadow-card px-2 py-4 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
              <span className="text-[26px]">{tpl.emoji}</span>
              <span className="text-[13px] font-bold text-ink text-center leading-tight">{t(tpl.nameKey as TKey)}</span>
            </button>
          ))}
        </div>

        {/* Saved plans archive */}
        <div data-tour="wo-plans">
        <h2 className="display-serif text-[20px] text-ink mt-7 mb-2.5">{t('workout.myPlans')}</h2>
        {(plans ?? []).length === 0 ? (
          <p className="rounded-card bg-card shadow-card px-4 py-5 text-center text-[13px] text-ink-3">{t('workout.plansEmpty')}</p>
        ) : (
          (plans ?? []).map((p) => (
            <div key={p.id} className="rounded-card bg-card shadow-card p-3.5 mb-2.5 flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--c-gold) 16%, transparent)', color: 'var(--c-gold-2)' }}>
                <BookMarked size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15.5px] font-bold text-ink truncate">{p.title}</div>
                <div className="text-[12.5px] text-ink-3 mt-0.5">{t('workout.planExercises', { n: p.entries.length })}</div>
              </div>
              <button onClick={() => void deleteWorkoutPlan(p.id)} aria-label={t('workout.deletePlan')} className="h-9 w-9 rounded-full flex items-center justify-center text-ink-3 flex-shrink-0 active:scale-90 transition-transform"><Trash2 size={16} /></button>
              <button onClick={() => void fromPlan(p.id)} aria-label={t('workout.startPlan')} className="h-10 w-10 rounded-full flex items-center justify-center text-on-primary flex-shrink-0 active:scale-90 transition-transform" style={{ background: 'var(--c-primary)' }}>
                <Play size={18} fill="currentColor" />
              </button>
            </div>
          ))
        )}
        </div>

        {/* Equipment + Activity + history shortcuts */}
        <div data-tour="wo-utils">
        <button onClick={() => setEquipOpen(true)} className="w-full rounded-card bg-card shadow-card px-4 py-3.5 mt-4 flex items-center justify-between active:bg-section transition-colors text-left">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><SlidersHorizontal size={18} className="text-habit" /> {t('workout.equipment')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </button>
        <button onClick={() => setRestOpen(true)} className="w-full rounded-card bg-card shadow-card px-4 py-3.5 mt-2.5 flex items-center justify-between active:bg-section transition-colors text-left">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><Timer size={18} className="text-habit" /> {t('workout.restDefault')}</span>
          <span className="flex items-center gap-1.5 text-[14px] font-bold text-ink-2">{restSec}s <ChevronRight size={18} className="text-ink-3" /></span>
        </button>
        <Link to="/allenamento/progressi" className="rounded-card bg-card shadow-card px-4 py-3.5 mt-2.5 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><TrendingUp size={18} className="text-habit" /> {t('workout.records')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>
        <Link to="/attivita" className="rounded-card bg-card shadow-card px-4 py-3.5 mt-2.5 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><Watch size={18} className="text-activity" /> {t('workout.activityLink')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>
        </div>

        {/* History */}
        <h2 className="display-serif text-[20px] text-ink mt-6 mb-2.5">{t('workout.history')}</h2>
        {(sessions ?? []).length === 0 ? (
          <p className="text-center text-[13px] text-ink-3 py-6">{t('workout.empty')}</p>
        ) : (
          (sessions ?? []).map((s) => {
            const sets = s.entries.reduce((n, e) => n + e.sets.length, 0);
            return (
              <Link key={s.id} to={`/allenamento/s/${s.id}`} className="rounded-card bg-card shadow-card p-4 mb-2.5 flex items-center justify-between active:bg-section transition-colors">
                <div className="min-w-0">
                  <div className="text-[15.5px] font-bold text-ink truncate flex items-center gap-2">
                    <span className="truncate">{s.title}</span>
                    {!s.finishedAt && <span className="text-[10px] font-bold text-on-primary px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--c-primary)' }}>{t('workout.inProgress')}</span>}
                  </div>
                  <div className="text-[12.5px] text-ink-3 mt-0.5 capitalize">{format(parseISO(s.date), 'EEE d MMM', { locale: activeDfnLocale() })} · {t('workout.summary', { ex: s.entries.length, sets })}</div>
                </div>
                <ChevronRight size={18} className="text-ink-3 flex-shrink-0" />
              </Link>
            );
          })
        )}

        {/* Editorial close */}
        <DailyInspiration className="mt-7" />
      </Screen>

      {genOpen && <GenerateSheet equipment={equipment} onClose={() => setGenOpen(false)} />}
      {equipOpen && <EquipmentSheet current={equipment} onClose={() => setEquipOpen(false)} />}
      {restOpen && (
        <Sheet open onClose={() => setRestOpen(false)} title={t('workout.restTitle')}>
          <div className="grid grid-cols-3 gap-2.5">
            {[15, 30, 45, 60, 75, 90, 120, 150, 180].map((n) => {
              const active = restSec === n;
              return (
                <button
                  key={n}
                  onClick={() => { void setRestSec(n); setRestOpen(false); }}
                  className="rounded-2xl py-4 text-[16px] font-bold text-ink flex items-center justify-center gap-1.5 transition-colors"
                  style={active ? { background: 'color-mix(in srgb, var(--c-primary) 16%, var(--c-card))', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-primary) 50%, transparent)' } : { background: 'var(--c-card)', boxShadow: 'inset 0 0 0 1px var(--c-line)' }}
                >
                  {active && <Check size={15} style={{ color: 'var(--c-primary)' }} strokeWidth={3} />} {n}s
                </button>
              );
            })}
          </div>
        </Sheet>
      )}
    </>
  );
}
