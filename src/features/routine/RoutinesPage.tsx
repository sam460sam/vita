import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Plus, Trash2, X } from 'lucide-react';
import { db } from '@/data/db';
import { createRoutine, saveRoutine, deleteRoutine, newRoutineStep } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Sheet, Field, Input, Button } from '@/ui';
import { useT, type TKey } from '@/i18n';
import type { Routine, RoutineStep } from '@/data/types';
import { RoutinePlayer } from './RoutinePlayer';
import { RoutineBuilder } from './RoutineBuilder';

const EMOJIS = ['☀️', '🌙', '🧘', '💪', '📖', '🌱', '🚿', '✍️', '🧠', '🏃'];

export function RoutinesPage() {
  const t = useT();
  const routines = useLiveQuery(() => db.routines.orderBy('order').toArray(), [], []);
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [editing, setEditing] = useState<Routine | 'new' | null>(null);
  const [building, setBuilding] = useState<'morning' | 'evening' | null>(null);

  const list = routines ?? [];

  // Quick-add templates that haven't been created yet (always available, not
  // just on the empty screen) so a one-tap morning + evening is always there.
  const tpls: { kind: 'morning' | 'evening'; emoji: string }[] = [
    { kind: 'morning', emoji: '☀️' },
    { kind: 'evening', emoji: '🌙' },
  ];
  const names = new Set(list.map((r) => r.name));
  const missing = tpls.filter((tp) => !names.has(t(`routine.tpl.${tp.kind}.name` as TKey)));

  return (
    <>
      <PageHeader title={t('routine.title')} back />
      <Screen>
        {list.length === 0 ? (
          <div className="text-center pt-6">
            <div className="text-[40px]">🌿</div>
            <h2 className="display-serif text-[22px] text-ink mt-2">{t('routine.emptyTitle')}</h2>
            <p className="text-[14px] text-ink-2 mt-1.5 max-w-xs mx-auto leading-relaxed">{t('routine.emptyDesc')}</p>
            <div className="flex flex-col gap-2.5 mt-6 max-w-xs mx-auto">
              <Button block onClick={() => setBuilding('morning')}>☀️ {t('routine.tpl.morning.name')}</Button>
              <Button block onClick={() => setBuilding('evening')}>🌙 {t('routine.tpl.evening.name')}</Button>
              <button onClick={() => setEditing('new')} className="text-[14px] font-semibold text-habit py-2">{t('routine.new')}</button>
            </div>
          </div>
        ) : (
          <>
            {list.map((r) => (
              <div key={r.id} className="rounded-card bg-card shadow-card p-4 mb-3 flex items-center gap-3">
                <button onClick={() => setEditing(r)} className="flex-1 min-w-0 flex items-center gap-3 text-left">
                  <span className="text-[28px]">{r.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-[16px] font-bold text-ink truncate">{r.name}</span>
                    <span className="block text-[13px] text-ink-3">{t('routine.stepsCount', { n: r.steps.length })}</span>
                  </span>
                </button>
                <button onClick={() => setPlaying(r)} aria-label={t('routine.start')} className="h-11 w-11 rounded-full flex items-center justify-center text-on-primary flex-shrink-0 active:scale-90 transition-transform" style={{ background: 'var(--c-primary)' }}>
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
            ))}
            {missing.length > 0 && (
              <div className="flex gap-2.5 mb-3">
                {missing.map((tp) => (
                  <button
                    key={tp.kind}
                    onClick={() => setBuilding(tp.kind)}
                    className="flex-1 rounded-card bg-card shadow-card px-3 py-3.5 flex items-center justify-center gap-2 text-[14px] font-bold text-ink active:scale-[0.97] transition-transform"
                  >
                    <span className="text-[18px]" aria-hidden>{tp.emoji}</span>
                    {t(`routine.tpl.${tp.kind}.name` as TKey)}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setEditing('new')} className="w-full mt-1 h-[52px] rounded-2xl text-on-primary font-bold text-[15.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-glow-strong" style={{ background: 'linear-gradient(180deg, #27EE76, #13C25C)' }}>
              <Plus size={20} /> {t('routine.new')}
            </button>
          </>
        )}
      </Screen>

      {building && <RoutineBuilder kind={building} onClose={() => setBuilding(null)} />}
      {editing && <RoutineForm routine={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {playing && <RoutinePlayer routine={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}

function RoutineForm({ routine, onClose }: { routine: Routine | null; onClose: () => void }) {
  const t = useT();
  const [name, setName] = useState(routine?.name ?? '');
  const [emoji, setEmoji] = useState(routine?.emoji ?? EMOJIS[0]);
  const [steps, setSteps] = useState<RoutineStep[]>(routine?.steps ?? []);
  const [draft, setDraft] = useState('');

  function addStep() {
    const v = draft.trim();
    if (!v) return;
    setSteps([...steps, newRoutineStep(v)]);
    setDraft('');
  }

  async function save() {
    if (!name.trim() || steps.length === 0) return;
    if (routine) await saveRoutine({ ...routine, name: name.trim(), emoji, steps });
    else await createRoutine({ name: name.trim(), emoji, steps });
    onClose();
  }

  async function remove() {
    if (routine) await deleteRoutine(routine.id);
    onClose();
  }

  return (
    <Sheet open onClose={onClose} title={routine ? t('routine.edit') : t('routine.new')}>
      <div className="space-y-4">
        <Field label={t('routine.name')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('routine.namePlaceholder')} />
        </Field>
        <Field label={t('routine.emoji')}>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-[20px]"
                style={{ background: emoji === e ? 'color-mix(in srgb, var(--c-primary) 18%, transparent)' : 'var(--c-section)', outline: emoji === e ? '2px solid var(--c-primary)' : 'none' }}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>
        <Field label={t('routine.steps')}>
          <div className="space-y-2">
            {steps.map((s, k) => (
              <div key={s.id} className="flex items-center gap-2 bg-section rounded-xl px-3 py-2.5">
                <span className="text-[12px] font-bold text-ink-3 w-5 flex-shrink-0">{k + 1}</span>
                <span className="flex-1 min-w-0 text-[14.5px] text-ink truncate">{s.title}</span>
                <button onClick={() => setSteps(steps.filter((x) => x.id !== s.id))} aria-label={t('common.close')} className="text-ink-3 flex-shrink-0"><X size={16} /></button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addStep(); }} placeholder={t('routine.addStep')} />
              <Button onClick={addStep}>+</Button>
            </div>
          </div>
        </Field>
        <Button block disabled={!name.trim() || steps.length === 0} onClick={() => void save()}>{t('common.save')}</Button>
        {routine && (
          <button onClick={() => void remove()} className="w-full text-[14px] font-semibold text-danger py-2 flex items-center justify-center gap-1.5">
            <Trash2 size={15} /> {t('common.delete')}
          </button>
        )}
      </div>
    </Sheet>
  );
}
