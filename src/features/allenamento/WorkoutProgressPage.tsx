import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { useT, type TKey } from '@/i18n';
import type { WorkoutSession } from '@/data/types';

interface ExProgress {
  id: string;
  name: string;
  muscle: string;
  /** Best single set ever. */
  bestW: number;
  bestReps: number;
  /** Estimated 1RM (0 for bodyweight). */
  e1rm: number;
  weighted: boolean;
  /** Per-session best metric (for the sparkline), oldest→newest. */
  points: number[];
  /** Running totals to derive the average rest actually taken. */
  restSum: number;
  restCount: number;
}

function epley(w: number, reps: number): number {
  return w * (1 + reps / 30);
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function compute(sessions: WorkoutSession[]): ExProgress[] {
  const finished = sessions.filter((s) => s.finishedAt).sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));
  const map = new Map<string, ExProgress>();

  for (const s of finished) {
    for (const e of s.entries) {
      let sessionBest = 0;
      let bw = 0;
      let br = 0;
      let weighted = false;
      for (const set of e.sets) {
        const metric = set.weightKg > 0 ? epley(set.weightKg, set.reps) : set.reps;
        if (metric > sessionBest && (set.weightKg > 0 || set.reps > 0)) {
          sessionBest = metric;
          bw = set.weightKg;
          br = set.reps;
          weighted = set.weightKg > 0;
        }
      }
      if (sessionBest <= 0) continue;
      const cur = map.get(e.exerciseId) ?? { id: e.exerciseId, name: e.name, muscle: e.muscle, bestW: 0, bestReps: 0, e1rm: 0, weighted, points: [], restSum: 0, restCount: 0 };
      cur.name = e.name;
      cur.points.push(Math.round(sessionBest));
      for (const set of e.sets) {
        if (set.restTakenSec && set.restTakenSec > 0) { cur.restSum += set.restTakenSec; cur.restCount += 1; }
      }
      const curBest = cur.weighted ? cur.e1rm : cur.bestReps;
      if (sessionBest > curBest) {
        cur.bestW = bw;
        cur.bestReps = br;
        cur.e1rm = weighted ? Math.round(epley(bw, br)) : 0;
        cur.weighted = weighted;
      }
      map.set(e.exerciseId, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.points.length - a.points.length);
}

export function WorkoutProgressPage() {
  const t = useT();
  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), [], []);
  const list = compute(sessions ?? []);

  return (
    <>
      <PageHeader title={t('workout.records')} back="/allenamento" />
      <Screen>
        {list.length === 0 ? (
          <p className="text-center text-[13px] text-ink-3 py-8">{t('workout.noProgress')}</p>
        ) : (
          list.map((ex) => {
            const max = Math.max(...ex.points, 1);
            return (
              <div key={ex.id} className="rounded-card bg-card shadow-card p-4 mb-3">
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[15.5px] font-bold text-ink truncate">{ex.name}</div>
                    <div className="text-[12px] text-ink-3">
                      {t(`muscle.${ex.muscle}` as TKey)}
                      {ex.restCount > 0 && <> · {t('workout.avgRest', { t: fmtTime(Math.round(ex.restSum / ex.restCount)) })}</>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[18px] font-extrabold text-ink tnum leading-none">
                      {ex.weighted ? `${ex.bestW} kg × ${ex.bestReps}` : `${ex.bestReps} ${t('workout.reps').toLowerCase()}`}
                    </div>
                    {ex.weighted && ex.e1rm > 0 && <div className="text-[11.5px] text-ink-3 mt-0.5">{t('workout.est1rm', { kg: ex.e1rm })}</div>}
                  </div>
                </div>
                {ex.points.length > 1 && (
                  <div className="flex items-end gap-[3px] h-12 mt-3">
                    {ex.points.map((p, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(8, (p / max) * 100)}%`, background: 'color-mix(in srgb, var(--c-habit) 70%, var(--c-section))' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </Screen>
    </>
  );
}
