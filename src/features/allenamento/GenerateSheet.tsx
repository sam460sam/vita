import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Minus, Plus } from 'lucide-react';
import { Sheet, Button } from '@/ui';
import { createWorkoutSession, saveWorkoutSession } from '@/data/repo';
import { useT, useI18n, type TKey } from '@/i18n';
import { MUSCLE_GROUPS } from './exercises';
import { generateWorkout, itemsToEntries } from './generator';
import type { Equipment, MuscleGroup } from '@/data/types';

/** Build a workout from your equipment + chosen muscles (rule-based, offline). */
export function GenerateSheet({ equipment, onClose }: { equipment: Equipment[]; onClose: () => void }) {
  const t = useT();
  const { lang } = useI18n();
  const nav = useNavigate();
  const [sel, setSel] = useState<Set<MuscleGroup>>(new Set());
  const [count, setCount] = useState(5);

  function toggle(m: MuscleGroup) {
    setSel((p) => {
      const n = new Set(p);
      n.has(m) ? n.delete(m) : n.add(m);
      return n;
    });
  }

  async function gen() {
    const items = generateWorkout({ muscles: [...sel], equipment, count });
    if (!items.length) return;
    const s = await createWorkoutSession(t('workout.generated'));
    await saveWorkoutSession({ ...s, entries: itemsToEntries(items, lang) });
    onClose();
    nav(`/allenamento/s/${s.id}`);
  }

  return (
    <Sheet open onClose={onClose} title={t('workout.generateTitle')}>
      <p className="text-[13px] text-ink-2 mb-3">{t('workout.generateDesc')}</p>

      <div className="text-[13px] font-semibold text-ink-2 mb-1.5">{t('workout.targets')}</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {MUSCLE_GROUPS.map((m) => {
          const on = sel.has(m);
          return (
            <button key={m} onClick={() => toggle(m)} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold" style={on ? { background: 'var(--c-primary)', color: 'var(--c-on-primary)' } : { background: 'var(--c-section)', color: 'var(--c-ink-2)' }}>
              {t(`muscle.${m}` as TKey)}
            </button>
          );
        })}
      </div>

      <div className="text-[13px] font-semibold text-ink-2 mb-1.5">{t('workout.exerciseCount')}</div>
      <div className="flex items-center gap-3">
        <button onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={count <= 1} aria-label="-" className="h-10 w-10 rounded-full bg-section text-ink flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"><Minus size={18} /></button>
        <input type="number" inputMode="numeric" value={count} onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))} aria-label={t('workout.exerciseCount')} className="w-16 bg-section rounded-xl py-2.5 text-center text-[18px] font-extrabold text-ink outline-none tnum" />
        <button onClick={() => setCount((c) => Math.min(20, c + 1))} disabled={count >= 20} aria-label="+" className="h-10 w-10 rounded-full bg-section text-ink flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"><Plus size={18} /></button>
        <span className="text-[13px] text-ink-3 ml-1">1–20</span>
      </div>

      <Button block className="mt-5" onClick={() => void gen()}><Sparkles size={16} className="inline mr-1" /> {t('workout.generateCta')}</Button>
    </Sheet>
  );
}
