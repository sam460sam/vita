import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Check, Trash2, Timer } from 'lucide-react';
import { db } from '@/data/db';
import { saveWorkoutSession, deleteWorkoutSession, newWorkoutEntry } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { platform } from '@/platform/platform';
import { useT, useI18n } from '@/i18n';
import type { WorkoutSession, WorkoutEntry, ExerciseDef } from '@/data/types';
import { exerciseName } from './exercises';
import { ExercisePicker } from './ExercisePicker';

export function WorkoutSessionPage() {
  const t = useT();
  const { lang } = useI18n();
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState<WorkoutSession | null | undefined>(undefined);
  const [picker, setPicker] = useState(false);
  const [rest, setRest] = useState<number | null>(null);

  useEffect(() => { void db.workoutSessions.get(id).then((x) => setSession(x ?? null)); }, [id]);

  // Rest countdown after completing a set.
  useEffect(() => {
    if (rest == null) return;
    if (rest <= 0) { platform.haptic(); setRest(null); return; }
    const tid = setTimeout(() => setRest((r) => (r == null ? r : r - 1)), 1000);
    return () => clearTimeout(tid);
  }, [rest]);

  if (session === undefined) return null;
  if (session === null) {
    nav('/allenamento', { replace: true });
    return null;
  }
  const s = session;

  function update(next: WorkoutSession) {
    setSession(next);
    void saveWorkoutSession(next);
  }
  function patchEntry(eid: string, fn: (e: WorkoutEntry) => WorkoutEntry) {
    update({ ...s, entries: s.entries.map((e) => (e.id === eid ? fn(e) : e)) });
  }
  function addExercise(def: ExerciseDef) {
    update({ ...s, entries: [...s.entries, newWorkoutEntry(def.id, exerciseName(def, lang), def.muscle)] });
    setPicker(false);
  }

  async function finish() {
    await saveWorkoutSession({ ...s, finishedAt: Date.now() });
    nav('/allenamento');
  }
  async function removeSession() {
    await deleteWorkoutSession(s.id);
    nav('/allenamento');
  }

  return (
    <>
      <PageHeader title={t('workout.session.title')} back="/allenamento" />
      <Screen>
        <input
          value={s.title}
          onChange={(e) => update({ ...s, title: e.target.value })}
          className="w-full bg-transparent display-serif text-[26px] text-ink outline-none mb-3"
          placeholder={t('workout.session.default')}
        />

        {s.entries.map((entry) => (
          <div key={entry.id} className="rounded-card bg-card shadow-card p-4 mb-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="text-[16px] font-bold text-ink truncate">{entry.name}</div>
                <div className="text-[12px] text-ink-3">{t(`muscle.${entry.muscle}`)}</div>
              </div>
              <button onClick={() => update({ ...s, entries: s.entries.filter((e) => e.id !== entry.id) })} aria-label={t('common.delete')} className="text-ink-3 p-1"><Trash2 size={16} /></button>
            </div>

            {/* header row */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-3 uppercase tracking-wide px-1 mb-1">
              <span className="w-6 text-center">#</span>
              <span className="flex-1 text-center">{t('workout.reps')}</span>
              <span className="flex-1 text-center">{t('workout.kg')}</span>
              <span className="w-8" />
              <span className="w-6" />
            </div>

            {entry.sets.map((set, k) => (
              <div key={k} className="flex items-center gap-2 mb-1.5">
                <span className="w-6 text-center text-[13px] font-bold text-ink-3">{k + 1}</span>
                <input
                  type="number" inputMode="numeric" value={set.reps || ''}
                  onChange={(e) => patchEntry(entry.id, (en) => ({ ...en, sets: en.sets.map((x, i) => (i === k ? { ...x, reps: parseInt(e.target.value) || 0 } : x)) }))}
                  className="flex-1 min-w-0 bg-section rounded-xl py-2 text-center text-[15px] font-semibold text-ink outline-none"
                />
                <input
                  type="number" inputMode="decimal" value={set.weightKg || ''}
                  onChange={(e) => patchEntry(entry.id, (en) => ({ ...en, sets: en.sets.map((x, i) => (i === k ? { ...x, weightKg: parseFloat(e.target.value) || 0 } : x)) }))}
                  className="flex-1 min-w-0 bg-section rounded-xl py-2 text-center text-[15px] font-semibold text-ink outline-none"
                />
                <button
                  onClick={() => { platform.haptic(); const turningOn = !set.done; patchEntry(entry.id, (en) => ({ ...en, sets: en.sets.map((x, i) => (i === k ? { ...x, done: !x.done } : x)) })); if (turningOn) setRest(90); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                  style={set.done ? { background: '#4F9D55', borderColor: '#4F9D55' } : { borderColor: 'var(--c-line)' }}
                  aria-label="done"
                >
                  {set.done && <Check size={15} className="text-white" strokeWidth={3} />}
                </button>
                <button onClick={() => patchEntry(entry.id, (en) => ({ ...en, sets: en.sets.filter((_, i) => i !== k) }))} aria-label={t('common.close')} className="w-6 text-ink-3 flex-shrink-0"><X size={15} /></button>
              </div>
            ))}

            <button
              onClick={() => patchEntry(entry.id, (en) => ({ ...en, sets: [...en.sets, { ...(en.sets[en.sets.length - 1] ?? { reps: 10, weightKg: 0 }), done: false }] }))}
              className="mt-2 text-[13.5px] font-semibold text-habit flex items-center gap-1"
            >
              <Plus size={15} /> {t('workout.addSet')}
            </button>
          </div>
        ))}

        <button onClick={() => setPicker(true)} className="w-full h-[52px] rounded-2xl bg-card shadow-card text-ink font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Plus size={20} className="text-habit" /> {t('workout.addExercise')}
        </button>

        {s.entries.length > 0 && (
          <button onClick={() => void finish()} className="w-full mt-3 h-[54px] rounded-2xl text-white font-bold text-[16px] flex items-center justify-center active:scale-[0.98] transition-transform shadow-card" style={{ background: 'linear-gradient(180deg, #125A3B, #0B3925)' }}>
            {t('workout.finishSession')}
          </button>
        )}

        <button onClick={() => void removeSession()} className="w-full text-[13.5px] font-semibold text-danger py-3 mt-1 flex items-center justify-center gap-1.5">
          <Trash2 size={15} /> {t('workout.deleteSession')}
        </button>
      </Screen>

      {picker && <ExercisePicker onAdd={addExercise} onClose={() => setPicker(false)} />}

      {rest != null && (
        <div className="fixed left-0 right-0 bottom-[calc(16px+env(safe-area-inset-bottom))] px-4 z-[60]">
          <div className="max-w-md mx-auto rounded-full shadow-nav flex items-center gap-3 px-5 py-3" style={{ background: 'var(--c-ink)', color: 'var(--c-app)' }}>
            <Timer size={18} />
            <span className="font-extrabold tnum text-[17px]">{fmtRest(rest)}</span>
            <span className="flex-1 text-[13px] opacity-80">{t('workout.rest')}</span>
            <button onClick={() => setRest((r) => (r ?? 0) + 15)} className="text-[13px] font-bold px-1.5">+15</button>
            <button onClick={() => setRest(null)} className="text-[13px] font-bold px-1.5">{t('workout.skip')}</button>
          </div>
        </div>
      )}
    </>
  );
}

function fmtRest(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
