import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Sheet, Input } from '@/ui';
import { useT, useI18n, type TKey } from '@/i18n';
import type { ExerciseDef, MuscleGroup } from '@/data/types';
import { EXERCISES, MUSCLE_GROUPS, exerciseName } from './exercises';
import { MuscleIcon, iconKindFor, MUSCLE_COLOR } from './MuscleIcon';

/** Sheet to pick an exercise from the bundled library (search + muscle filter). */
export function ExercisePicker({ onAdd, onClose }: { onAdd: (def: ExerciseDef) => void; onClose: () => void }) {
  const t = useT();
  const { lang } = useI18n();
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | 'all'>('all');

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return EXERCISES.filter((e) => (muscle === 'all' || e.muscle === muscle) && (!query || exerciseName(e, lang).toLowerCase().includes(query) || e.nameEn.toLowerCase().includes(query)));
  }, [q, muscle, lang]);

  return (
    <Sheet open onClose={onClose} title={t('workout.pickTitle')} size="full">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('workout.search')} />

      <div className="flex gap-2 overflow-x-auto py-3 -mx-1 px-1">
        <Chip on={muscle === 'all'} onClick={() => setMuscle('all')} label={t('workout.allMuscles')} />
        {MUSCLE_GROUPS.map((m) => (
          <Chip key={m} on={muscle === m} onClick={() => setMuscle(m)} label={t(`muscle.${m}` as TKey)} />
        ))}
      </div>

      <div className="space-y-1.5 pb-2">
        {list.map((e) => (
          <button key={e.id} onClick={() => onAdd(e)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-section text-left active:opacity-80">
            {(() => { const k = iconKindFor(e.id, e.muscle); const c = MUSCLE_COLOR[k]; return (
              <span className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${c} 16%, var(--c-card))`, color: c, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 40%, transparent)` }}><MuscleIcon kind={k} size={20} /></span>
            ); })()}
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-ink truncate">{exerciseName(e, lang)}</span>
              <span className="block text-[12px] text-ink-3">{t(`muscle.${e.muscle}` as TKey)}</span>
            </span>
            <span className="h-8 w-8 rounded-full flex items-center justify-center text-on-primary flex-shrink-0" style={{ background: 'var(--c-primary)' }}><Plus size={18} /></span>
          </button>
        ))}
        {list.length === 0 && <p className="text-center text-[13px] text-ink-3 py-6">{t('workout.noExercise')}</p>}
      </div>
    </Sheet>
  );
}

function Chip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap flex-shrink-0" style={on ? { background: 'var(--c-primary)', color: 'var(--c-on-primary)' } : { background: 'var(--c-section)', color: 'var(--c-ink-2)' }}>
      {label}
    </button>
  );
}
