import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, ChevronRight, Watch, Sparkles, Copy, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { db } from '@/data/db';
import { createWorkoutSession, saveWorkoutSession, duplicateWorkoutSession, readSettings } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { activeDfnLocale } from '@/lib/format';
import { useT, useI18n, type TKey } from '@/i18n';
import { EQUIPMENT_LIST } from './exercises';
import { TEMPLATES, templateItems, itemsToEntries } from './generator';
import { GenerateSheet } from './GenerateSheet';
import { EquipmentSheet } from './EquipmentSheet';
import type { Equipment } from '@/data/types';

/** Strength-training hub: start / generate / templates / history. */
export function WorkoutPage() {
  const t = useT();
  const { lang } = useI18n();
  const nav = useNavigate();
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('createdAt').reverse().toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const [genOpen, setGenOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);

  const equipment: Equipment[] = settings?.equipment ?? EQUIPMENT_LIST;
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

  return (
    <>
      <PageHeader title={t('workout.title')} />
      <Screen>
        <button onClick={() => void start()} className="w-full h-[58px] rounded-2xl text-white font-bold text-[16.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-card" style={{ background: 'linear-gradient(180deg, #6FBE6F, #2F7D43)' }}>
          <Dumbbell size={21} /> {t('workout.start')}
        </button>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => setGenOpen(true)} className="rounded-card bg-card shadow-card px-3 py-4 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
            <Sparkles size={22} className="text-habit" />
            <span className="text-[14px] font-bold text-ink text-center leading-tight">{t('workout.generate')}</span>
          </button>
          <button onClick={() => void duplicate()} disabled={!lastFinished} className="rounded-card bg-card shadow-card px-3 py-4 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform disabled:opacity-40">
            <Copy size={22} className="text-activity" />
            <span className="text-[14px] font-bold text-ink text-center leading-tight">{t('workout.duplicate')}</span>
          </button>
        </div>

        {/* Templates */}
        <h2 className="display-serif text-[20px] text-ink mt-6 mb-2.5">{t('workout.templates')}</h2>
        <div className="flex gap-2.5 overflow-x-auto -mx-1 px-1 pb-1">
          {TEMPLATES.map((tpl) => (
            <button key={tpl.id} onClick={() => void fromTemplate(tpl.id)} className="flex-shrink-0 w-[120px] rounded-card bg-card shadow-card px-3 py-4 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
              <span className="text-[26px]">{tpl.emoji}</span>
              <span className="text-[13.5px] font-bold text-ink text-center leading-tight">{t(tpl.nameKey as TKey)}</span>
            </button>
          ))}
        </div>

        {/* Equipment + Activity */}
        <button onClick={() => setEquipOpen(true)} className="w-full rounded-card bg-card shadow-card px-4 py-3.5 mt-4 flex items-center justify-between active:bg-section transition-colors text-left">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><SlidersHorizontal size={18} className="text-habit" /> {t('workout.equipment')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </button>
        <Link to="/allenamento/progressi" className="rounded-card bg-card shadow-card px-4 py-3.5 mt-2.5 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><TrendingUp size={18} className="text-habit" /> {t('workout.records')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>
        <Link to="/attivita" className="rounded-card bg-card shadow-card px-4 py-3.5 mt-2.5 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><Watch size={18} className="text-activity" /> {t('workout.activityLink')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>

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
      </Screen>

      {genOpen && <GenerateSheet equipment={equipment} onClose={() => setGenOpen(false)} />}
      {equipOpen && <EquipmentSheet current={equipment} onClose={() => setEquipOpen(false)} />}
    </>
  );
}
