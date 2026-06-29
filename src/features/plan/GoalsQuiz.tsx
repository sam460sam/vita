import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Plus } from 'lucide-react';
import { db } from '@/data/db';
import { createHabit } from '@/data/repo';
import { Sheet, Button, Icon } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { RECOMMENDED_BY_ID } from '@/features/abitudini/recommended';

/** Areas the short goals test offers → the recommended habit ids they map to. */
const AREAS: { id: string; emoji: string; labelKey: TKey; habits: string[] }[] = [
  { id: 'fitness', emoji: '💪', labelKey: 'goalsq.area.fitness', habits: ['move', 'gym', 'stretch', 'water'] },
  { id: 'mind', emoji: '🧠', labelKey: 'goalsq.area.mind', habits: ['meditate', 'gratitude', 'read'] },
  { id: 'sleep', emoji: '😴', labelKey: 'goalsq.area.sleep', habits: ['sleep', 'sun'] },
  { id: 'health', emoji: '🥗', labelKey: 'goalsq.area.health', habits: ['water', 'fruit', 'nosmoke'] },
  { id: 'energy', emoji: '⚡', labelKey: 'goalsq.area.energy', habits: ['sun', 'move', 'read'] },
];

/** A short, friendly test: pick the areas you want to improve → get a tailored
 *  set of habits you can add with one tap. */
export function GoalsQuiz({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'pick' | 'result'>('pick');
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const existingRecIds = new Set((habits ?? []).map((h) => h.recId).filter(Boolean));

  const suggestedIds = Array.from(new Set(AREAS.filter((a) => sel.has(a.id)).flatMap((a) => a.habits))).filter((id) => RECOMMENDED_BY_ID[id]);

  function toggle(id: string) {
    setSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <Sheet open onClose={onClose} title={t('goalsq.title')}>
      {step === 'pick' ? (
        <div>
          <p className="text-[14px] text-ink-2 mb-3">{t('goalsq.subtitle')}</p>
          <div className="space-y-2">
            {AREAS.map((a) => {
              const on = sel.has(a.id);
              return (
                <button key={a.id} onClick={() => toggle(a.id)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-section text-left transition-all" style={{ outline: on ? '2px solid var(--c-primary)' : 'none' }}>
                  <span className="text-[22px]">{a.emoji}</span>
                  <span className="flex-1 text-[15px] font-semibold text-ink">{t(a.labelKey)}</span>
                  <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={on ? { background: 'var(--c-primary)' } : { border: '2px solid var(--c-line)' }}>
                    {on && <Check size={14} className="text-white" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
          <Button block className="mt-4" disabled={sel.size === 0} onClick={() => setStep('result')}>{t('goalsq.see')}</Button>
        </div>
      ) : (
        <div>
          <p className="text-[14px] text-ink-2 mb-3">{t('goalsq.resultSubtitle')}</p>
          <div className="space-y-2">
            {suggestedIds.map((id) => {
              const rec = RECOMMENDED_BY_ID[id];
              const added = existingRecIds.has(id);
              return (
                <div key={id} className="flex items-center gap-3 p-3 rounded-2xl bg-section">
                  <span style={{ color: rec.color }}><Icon name={rec.icon} size={20} /></span>
                  <span className="flex-1 min-w-0 text-[15px] font-semibold text-ink truncate">{t(rec.labelKey)}</span>
                  <button
                    disabled={added}
                    onClick={() => void createHabit({ name: t(rec.labelKey), recId: rec.id, color: rec.color, icon: rec.icon, frequency: rec.frequency })}
                    className="h-8 px-3 rounded-full text-[13px] font-bold flex items-center gap-1 flex-shrink-0"
                    style={added ? { background: 'var(--c-section)', color: 'var(--c-ink-3)' } : { background: 'var(--c-primary)', color: 'var(--c-on-primary)' }}
                  >
                    {added ? t('goalsq.added') : <><Plus size={14} /> {t('goalsq.add')}</>}
                  </button>
                </div>
              );
            })}
          </div>
          <Button block className="mt-4" onClick={onClose}>{t('goalsq.done')}</Button>
        </div>
      )}
    </Sheet>
  );
}
