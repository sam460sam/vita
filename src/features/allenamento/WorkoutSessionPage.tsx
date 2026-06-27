import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, Check, Trash2, Timer, BookMarked, X, SlidersHorizontal } from 'lucide-react';
import { db } from '@/data/db';
import { saveWorkoutSession, deleteWorkoutSession, newWorkoutEntry, createWorkoutPlan, readSettings } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { useToast } from '@/ui';
import { platform } from '@/platform/platform';
import { useT, useI18n } from '@/i18n';
import type { WorkoutSession, WorkoutEntry, ExerciseDef } from '@/data/types';
import { exerciseName } from './exercises';
import { ExercisePicker } from './ExercisePicker';
import { lastStatFor, suggestNextWeight, suggestNextReps, prevBestMetric, currentBestMetric } from './progression';

// A quick visual cue per muscle group, so each exercise reads at a glance.
const MUSCLE_EMOJI: Record<string, string> = {
  chest: '💪', back: '🪢', legs: '🦵', shoulders: '🏋️', arms: '🦾', core: '🧱', fullbody: '🔥',
};

export function WorkoutSessionPage() {
  const t = useT();
  const { lang } = useI18n();
  const toast = useToast();
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState<WorkoutSession | null | undefined>(undefined);
  const [picker, setPicker] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, string>>({});
  // Timestamp-based rest timer: accurate even across re-renders / backgrounding.
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [, forceTick] = useState(0);
  const [restCtx, setRestCtx] = useState<{ eid: string; k: number; startedAt: number } | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<WorkoutSession | null>(null);
  sessionRef.current = session ?? null; // always the latest, for the rest-timer callback
  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const defaultRest = settings?.restSec ?? 90;

  useEffect(() => { void db.workoutSessions.get(id).then((x) => setSession(x ?? null)); }, [id]);

  // Drive the live rest countdown; ring + finalize exactly when it hits zero.
  useEffect(() => {
    if (restEndsAt == null) return;
    const tid = setInterval(() => {
      if (Date.now() >= restEndsAt) { ring(); endRest(); }
      else forceTick((x) => x + 1);
    }, 250);
    return () => clearInterval(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restEndsAt]);

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
  function setSetField(eid: string, k: number, fn: (set: WorkoutSession['entries'][number]['sets'][number]) => WorkoutSession['entries'][number]['sets'][number]) {
    patchEntry(eid, (en) => ({ ...en, sets: en.sets.map((x, i) => (i === k ? fn(x) : x)) }));
  }
  function commitSession(next: WorkoutSession) {
    sessionRef.current = next;
    setSession(next);
    void saveWorkoutSession(next);
  }
  // Fold the rest actually taken (on the set that started the timer) into a base
  // session — pure, so callers can compose it with other edits in one write.
  function applyPendingRest(base: WorkoutSession): WorkoutSession {
    if (!restCtx) return base;
    const taken = Math.max(1, Math.round((Date.now() - restCtx.startedAt) / 1000));
    return { ...base, entries: base.entries.map((e) => (e.id === restCtx.eid ? { ...e, sets: e.sets.map((x, i) => (i === restCtx.k ? { ...x, restTakenSec: taken } : x)) } : e)) };
  }
  function beginRest(eid: string, k: number, durSec: number) {
    ensureAudio();
    setRestEndsAt(Date.now() + durSec * 1000);
    setRestCtx({ eid, k, startedAt: Date.now() });
  }
  function clearRest() { setRestEndsAt(null); setRestCtx(null); }
  // Skip / timer-up: record the pending rest on the latest session, then stop.
  function endRest() {
    const base = sessionRef.current;
    if (base && restCtx) commitSession(applyPendingRest(base));
    clearRest();
  }
  // Prime the audio context on the user gesture that starts the rest, so the
  // end-of-rest beep is allowed to play later on iOS.
  function ensureAudio() {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current.state === 'suspended') void audioRef.current.resume();
    } catch { /* ignore */ }
  }
  function ring() {
    platform.haptic();
    try { navigator.vibrate?.([140, 70, 140]); } catch { /* ignore */ }
    const ac = audioRef.current;
    if (!ac) return;
    try {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.4);
      o.start(); o.stop(ac.currentTime + 0.42);
    } catch { /* ignore */ }
  }
  const REST_PRESETS = [15, 30, 45, 60, 75, 90, 120, 150, 180];
  function cycleRest(eid: string, cur: number) {
    platform.haptic();
    const i = REST_PRESETS.findIndex((p) => p >= cur);
    const next = REST_PRESETS[(i < 0 ? -1 : i) + 1] ?? REST_PRESETS[0];
    patchEntry(eid, (en) => ({ ...en, restSec: next }));
  }
  // Collapsed model: one row per exercise = N sets of the same reps × kg.
  const clampN = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
  function setReps(eid: string, r: number) {
    patchEntry(eid, (en) => ({ ...en, sets: en.sets.map((x) => ({ ...x, reps: r })) }));
  }
  function setKg(eid: string, kg: number) {
    patchEntry(eid, (en) => ({ ...en, sets: en.sets.map((x) => ({ ...x, weightKg: kg })) }));
  }
  // A decimal-friendly numeric field: keeps the raw text while typing (so "22.5"
  // and a trailing dot survive) and commits the parsed number.
  function decField(key: string, current: number, commit: (n: number) => void) {
    return {
      type: 'text' as const,
      inputMode: 'decimal' as const,
      value: edits[key] ?? (current ? String(current) : ''),
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (!/^\d*[.,]?\d*$/.test(v)) return;
        setEdits((p) => ({ ...p, [key]: v }));
        const n = parseFloat(v.replace(',', '.'));
        commit(Number.isFinite(n) ? n : 0);
      },
      onBlur: () => setEdits((p) => { const n = { ...p }; delete n[key]; return n; }),
    };
  }
  function toggleExpand(eid: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(eid)) n.delete(eid); else n.add(eid);
      return n;
    });
  }
  function addSet(eid: string) {
    patchEntry(eid, (en) => ({ ...en, sets: [...en.sets, { ...(en.sets[en.sets.length - 1] ?? { reps: 10, weightKg: 0 }), done: false }] }));
  }
  function removeSet(eid: string, k: number) {
    patchEntry(eid, (en) => ({ ...en, sets: en.sets.length > 1 ? en.sets.filter((_, i) => i !== k) : en.sets }));
  }
  function setCount(eid: string, n: number) {
    platform.haptic();
    patchEntry(eid, (en) => {
      const total = clampN(n, 1, 30);
      const r = en.sets[0]?.reps ?? 10;
      const w = en.sets[0]?.weightKg ?? 0;
      const sets = en.sets.slice(0, total);
      while (sets.length < total) sets.push({ reps: r, weightKg: w, done: false });
      return { ...en, sets };
    });
  }
  // Tap the progress pill: complete the next set (1/4 → 2/4 …); wraps to 0/N.
  // Folds any pending rest + the new done-count into a single write.
  function tickSet(entry: WorkoutEntry) {
    platform.haptic();
    const base0 = sessionRef.current ?? s;
    const live = base0.entries.find((e) => e.id === entry.id) ?? entry;
    const total = live.sets.length;
    const done = live.sets.filter((x) => x.done).length;
    let next = done + 1;
    const advancing = next <= total;
    if (next > total) next = 0;
    const base = applyPendingRest(base0);
    commitSession({ ...base, entries: base.entries.map((e) => (e.id === entry.id ? { ...e, sets: e.sets.map((x, i) => ({ ...x, done: i < next })) } : e)) });
    if (advancing) beginRest(entry.id, next - 1, live.restSec ?? defaultRest);
    else clearRest();
  }
  // Toggle a single set's done state (expanded per-set view).
  function toggleSetDone(entry: WorkoutEntry, k: number, currentlyDone: boolean) {
    platform.haptic();
    const base0 = sessionRef.current ?? s;
    const base = applyPendingRest(base0);
    commitSession({ ...base, entries: base.entries.map((e) => (e.id === entry.id ? { ...e, sets: e.sets.map((x, i) => (i === k ? { ...x, done: !x.done } : x)) } : e)) });
    const live = base.entries.find((e) => e.id === entry.id);
    if (!currentlyDone) beginRest(entry.id, k, live?.restSec ?? defaultRest);
    else clearRest();
  }
  function addExercise(def: ExerciseDef) {
    update({ ...s, entries: [...s.entries, newWorkoutEntry(def.id, exerciseName(def, lang), def.muscle)] });
    setPicker(false);
  }
  // Fill the empty (0 kg) sets of an exercise with the suggested next load.
  function applyWeight(eid: string, w: number) {
    platform.haptic();
    patchEntry(eid, (en) => ({ ...en, sets: en.sets.map((x) => (x.weightKg === 0 ? { ...x, weightKg: w } : x)) }));
  }
  function applyReps(eid: string, r: number) {
    platform.haptic();
    patchEntry(eid, (en) => ({ ...en, sets: en.sets.map((x) => ({ ...x, reps: r })) }));
  }

  async function finish() {
    const base = applyPendingRest(sessionRef.current ?? s);
    await saveWorkoutSession({ ...base, finishedAt: Date.now() });
    nav('/allenamento');
  }
  async function removeSession() {
    await deleteWorkoutSession(s.id);
    nav('/allenamento');
  }
  async function saveAsPlan() {
    const cur = sessionRef.current ?? s;
    await createWorkoutPlan(cur.title || t('workout.session.default'), cur.entries, 'manual');
    toast.show(t('workout.planSaved'));
  }

  const restLeft = restEndsAt != null ? Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000)) : null;

  return (
    <>
      <PageHeader
        title={t('workout.session.title')}
        back="/allenamento"
        action={restLeft != null ? (
          <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full font-extrabold text-[14px] tnum" style={{ background: 'color-mix(in srgb, var(--c-primary) 22%, var(--c-card))', color: 'var(--c-habit)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-primary) 55%, transparent)' }}>
            <Timer size={14} /> {fmtRest(restLeft)}
          </span>
        ) : undefined}
      />
      <Screen>
        <input
          value={s.title}
          onChange={(e) => update({ ...s, title: e.target.value })}
          className="w-full bg-transparent display-serif text-[26px] text-ink outline-none mb-3"
          placeholder={t('workout.session.default')}
        />

        {s.entries.map((entry) => {
          const last = lastStatFor(sessions ?? [], entry.exerciseId);
          const nextW = last ? suggestNextWeight(last) : 0;
          const nextR = last ? suggestNextReps(last) : 0;
          const prevBest = prevBestMetric(sessions ?? [], entry.exerciseId, s.id);
          const isPR = prevBest > 0 && currentBestMetric(entry) > prevBest;
          const isExpanded = expanded.has(entry.id);
          return (
          <div key={entry.id} className="rounded-card bg-card shadow-card p-4 mb-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-10 w-10 rounded-xl flex items-center justify-center text-[20px] flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--c-primary) 12%, var(--c-card))', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-primary) 30%, transparent)' }} aria-hidden>
                  {MUSCLE_EMOJI[entry.muscle] ?? '🏋️'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold text-ink truncate">{entry.name}</span>
                    {isPR && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--c-gold) 22%, transparent)', color: 'var(--c-gold-2)' }}>
                        🏆 {t('workout.pr')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-ink-3">
                    <span>{t(`muscle.${entry.muscle}`)}</span>
                    <span aria-hidden>·</span>
                    <button onClick={() => cycleRest(entry.id, entry.restSec ?? defaultRest)} className="inline-flex items-center gap-1 font-semibold active:scale-95 transition-transform" style={{ color: 'var(--c-ink-2)' }}>
                      <Timer size={12} /> {entry.restSec ?? defaultRest}s
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => toggleExpand(entry.id)} aria-label={t('workout.perSet')} className="p-1.5 active:scale-90 transition-transform" style={{ color: isExpanded ? 'var(--c-primary)' : 'var(--c-ink-3)' }}><SlidersHorizontal size={16} /></button>
                <button onClick={() => update({ ...s, entries: s.entries.filter((e) => e.id !== entry.id) })} aria-label={t('common.delete')} className="text-ink-3 p-1.5"><Trash2 size={16} /></button>
              </div>
            </div>

            {/* Progression hint: what you did last time + a one-tap suggested target. */}
            {last && (
              <div className="flex items-center gap-2 -mt-1 mb-2.5 flex-wrap">
                <span className="text-[12px] text-ink-3">
                  {last.weightKg > 0 ? t('workout.lastTime', { w: last.weightKg, r: last.reps }) : t('workout.lastTimeReps', { r: last.reps })}
                </span>
                {nextW > 0 && (
                  <button onClick={() => applyWeight(entry.id, nextW)} className="text-[12px] font-bold px-2.5 py-0.5 rounded-full active:scale-95 transition-transform" style={{ background: 'color-mix(in srgb, var(--c-gold) 18%, transparent)', color: 'var(--c-gold-2)' }}>
                    {t('workout.tryWeight', { w: nextW })}
                  </button>
                )}
                {nextW === 0 && nextR > 0 && (
                  <button onClick={() => applyReps(entry.id, nextR)} className="text-[12px] font-bold px-2.5 py-0.5 rounded-full active:scale-95 transition-transform" style={{ background: 'color-mix(in srgb, var(--c-gold) 18%, transparent)', color: 'var(--c-gold-2)' }}>
                    {t('workout.tryReps', { r: nextR })}
                  </button>
                )}
              </div>
            )}

            {/* Expanded: per-set rows (different reps/kg per set, e.g. pyramid). */}
            {isExpanded && (
              <>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-ink-3 uppercase tracking-wide px-1 mb-1">
                  <span className="w-5 text-center">#</span>
                  <span className="flex-1 text-center">{t('workout.reps')}</span>
                  <span className="flex-1 text-center">{t('workout.kg')}</span>
                  <span className="w-8" />
                  <span className="w-5" />
                </div>
                {entry.sets.map((set, k) => (
                  <div key={k} className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 text-center text-[13px] font-bold text-ink-3">{k + 1}</span>
                    <input type="number" inputMode="numeric" value={set.reps || ''} onChange={(e) => setSetField(entry.id, k, (x) => ({ ...x, reps: parseInt(e.target.value) || 0 }))} className="flex-1 min-w-0 bg-section rounded-xl py-2 text-center text-[15px] font-semibold text-ink outline-none" />
                    <input {...decField(`${entry.id}-${k}-kg`, set.weightKg, (n) => setSetField(entry.id, k, (x) => ({ ...x, weightKg: n })))} className="flex-1 min-w-0 bg-section rounded-xl py-2 text-center text-[15px] font-semibold text-ink outline-none" />
                    <button onClick={() => toggleSetDone(entry, k, set.done)} aria-label="done" className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2" style={set.done ? { background: '#4F9D55', borderColor: '#4F9D55' } : { borderColor: 'var(--c-line)' }}>
                      {set.done && <Check size={15} className="text-white" strokeWidth={3} />}
                    </button>
                    <button onClick={() => removeSet(entry.id, k)} aria-label={t('common.close')} className="w-5 text-ink-3 flex-shrink-0"><X size={15} /></button>
                  </div>
                ))}
                <button onClick={() => addSet(entry.id)} className="mt-1.5 text-[13.5px] font-semibold text-habit flex items-center gap-1"><Plus size={15} /> {t('workout.addSet')}</button>
              </>
            )}

            {/* Collapsed: one row = N sets of the same reps × kg; tap the pill to
                tick off a set (1/4 → 2/4 …). */}
            {!isExpanded && (() => {
              const reps = entry.sets[0]?.reps ?? 0;
              const kg = entry.sets[0]?.weightKg ?? 0;
              const total = entry.sets.length;
              const done = entry.sets.filter((x) => x.done).length;
              const full = total > 0 && done >= total;
              return (
                <>
                  <div className="flex items-end gap-2.5">
                    <label className="flex-1 min-w-0">
                      <span className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wide mb-1 px-1">{t('workout.reps')}</span>
                      <input type="number" inputMode="numeric" value={reps || ''} onChange={(e) => setReps(entry.id, parseInt(e.target.value) || 0)} className="w-full bg-section rounded-xl py-2.5 text-center text-[16px] font-bold text-ink outline-none" />
                    </label>
                    <span className="text-ink-3 text-[15px] font-bold pb-2.5">×</span>
                    <label className="flex-1 min-w-0">
                      <span className="block text-[10px] font-semibold text-ink-3 uppercase tracking-wide mb-1 px-1">{t('workout.kg')}</span>
                      <input {...decField(`${entry.id}-kg`, kg, (n) => setKg(entry.id, n))} className="w-full bg-section rounded-xl py-2.5 text-center text-[16px] font-bold text-ink outline-none" />
                    </label>
                    <button
                      onClick={() => tickSet(entry)}
                      aria-label={`${done}/${total}`}
                      className="flex-shrink-0 h-[46px] min-w-[74px] px-3 rounded-xl flex items-center justify-center gap-1.5 font-extrabold text-[17px] active:scale-95 transition-transform"
                      style={full
                        ? { background: 'linear-gradient(180deg,#3BD27A,#23A85B)', color: '#04130a', boxShadow: '0 0 0 1px rgba(34,227,106,0.45), 0 6px 16px rgba(34,227,106,0.30)' }
                        : done > 0
                          ? { background: 'color-mix(in srgb, var(--c-primary) 30%, var(--c-card))', color: 'var(--c-ink)', boxShadow: 'inset 0 0 0 1.5px var(--c-habit), 0 0 14px rgba(34,227,106,0.20)' }
                          : { background: 'color-mix(in srgb, var(--c-primary) 16%, var(--c-card))', color: 'var(--c-habit)', boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--c-habit) 55%, transparent)' }}
                    >
                      <span className="tnum">{done}/{total}</span>
                      {full ? <Check size={17} strokeWidth={3} /> : <Check size={16} strokeWidth={2.6} style={{ opacity: 0.5 }} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-[12.5px] font-semibold text-ink-3">{t('workout.sets')}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button onClick={() => setCount(entry.id, total - 1)} disabled={total <= 1} aria-label="-" className="h-8 w-8 rounded-full bg-section text-ink flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"><Minus size={16} /></button>
                      <input type="number" inputMode="numeric" value={total} onChange={(e) => setCount(entry.id, parseInt(e.target.value) || 1)} aria-label={t('workout.sets')} className="w-12 bg-section rounded-lg py-1.5 text-center text-[16px] font-extrabold text-ink outline-none tnum" />
                      <button onClick={() => setCount(entry.id, total + 1)} disabled={total >= 30} aria-label="+" className="h-8 w-8 rounded-full bg-section text-ink flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"><Plus size={16} /></button>
                    </div>
                  </div>
                </>
              );
            })()}

            {entry.sets.some((x) => x.restTakenSec) && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 px-1 mt-2">
                {entry.sets.map((set, k) => set.restTakenSec ? (
                  <span key={k} className="text-[10.5px] text-ink-3">{k + 1}: ↺ {fmtRest(set.restTakenSec)}</span>
                ) : null)}
              </div>
            )}
          </div>
          );
        })}

        <button onClick={() => setPicker(true)} className="w-full h-[52px] rounded-2xl bg-card shadow-card text-ink font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Plus size={20} className="text-habit" /> {t('workout.addExercise')}
        </button>

        {s.entries.length > 0 && (
          <>
            <button onClick={() => void finish()} className="w-full mt-3 h-[54px] rounded-2xl text-white font-bold text-[16px] flex items-center justify-center active:scale-[0.98] transition-transform shadow-card" style={{ background: 'linear-gradient(180deg, #125A3B, #0B3925)' }}>
              {t('workout.finishSession')}
            </button>
            <button onClick={() => void saveAsPlan()} className="w-full mt-2.5 h-[50px] rounded-2xl bg-card shadow-card text-ink font-bold text-[14.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <BookMarked size={17} style={{ color: 'var(--c-gold-2)' }} /> {t('workout.saveAsPlan')}
            </button>
          </>
        )}

        <button onClick={() => void removeSession()} className="w-full text-[13.5px] font-semibold text-danger py-3 mt-1 flex items-center justify-center gap-1.5">
          <Trash2 size={15} /> {t('workout.deleteSession')}
        </button>
      </Screen>

      {picker && <ExercisePicker onAdd={addExercise} onClose={() => setPicker(false)} />}

      {restEndsAt != null && (() => {
        const remaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
        const total = restCtx ? Math.max(1, Math.round((restEndsAt - restCtx.startedAt) / 1000)) : remaining;
        const frac = Math.min(1, Math.max(0, (total - remaining) / total));
        return (
          <div className="fixed left-0 right-0 bottom-[calc(16px+env(safe-area-inset-bottom))] px-4 z-[60]">
            <div className="max-w-md mx-auto rounded-full shadow-nav relative overflow-hidden flex items-center gap-3 px-5 py-3" style={{ background: 'var(--c-ink)', color: 'var(--c-app)' }}>
              <div aria-hidden className="absolute inset-y-0 left-0 transition-[width] duration-300" style={{ width: `${frac * 100}%`, background: 'color-mix(in srgb, var(--c-primary) 32%, transparent)' }} />
              <Timer size={18} className="relative" />
              <span className="relative font-extrabold tnum text-[18px]">{fmtRest(remaining)}</span>
              <span className="relative flex-1 text-[13px] opacity-80">{t('workout.rest')}</span>
              <button onClick={() => setRestEndsAt((e) => (e ?? Date.now()) + 15000)} className="relative text-[13px] font-bold px-2">+15</button>
              <button onClick={endRest} className="relative text-[13px] font-bold px-2">{t('workout.skip')}</button>
            </div>
          </div>
        );
      })()}
    </>
  );
}

function fmtRest(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
