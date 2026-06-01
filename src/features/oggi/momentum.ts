// ============================================================================
// Daily "momentum" — a single cross-life score (0..100) that unifies progress
// across ALL modules. This is Vita's unique edge: no single-purpose app can do
// a whole-life score. Stella reacts to it (gentle, non-punishing à la Finch).
// ============================================================================
import { startOfDay } from 'date-fns';
import type { Habit, HabitLog, Settings, Task, WaterLog, Workout, JournalEntry } from '@/data/types';
import { todayISO } from '@/lib/format';
import { isScheduled, isDone } from '@/features/abitudini/logic';

export interface Momentum {
  score: number; // 0..100
  rings: { habits: number; water: number; tasks: number; move: number; mind: number }; // each 0..1
  done: { habits: [number, number]; waterPct: number; tasks: number; workout: boolean; journal: boolean };
}

/** Compute today's momentum from current data. Weighted, forgiving (caps at 100). */
export function computeMomentum(
  settings: Settings,
  habits: Habit[],
  logs: HabitLog[],
  tasks: Task[],
  workouts: Workout[],
  water: WaterLog | undefined,
  journals: JournalEntry[],
): Momentum {
  const today = todayISO();
  const dayStart = startOfDay(new Date()).getTime();

  // Habits scheduled today
  const scheduled = habits.filter((h) => !h.archived && isScheduled(h, today));
  const habitsDone = scheduled.filter((h) => isDone(logs, h.id, today)).length;
  const habitsRing = scheduled.length ? habitsDone / scheduled.length : 0;

  // Water
  const goalMl = settings.water.dailyGoalMl || 2000;
  const waterRing = Math.min(1, (water?.ml ?? 0) / goalMl);

  // Tasks closed today (relative to a soft daily target of 3)
  const tasksClosed = tasks.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= dayStart).length;
  const tasksRing = Math.min(1, tasksClosed / 3);

  // Movement: any workout today, or move-kcal goal progress
  const todays = workouts.filter((w) => w.startedAt >= dayStart);
  const moveKcal = todays.reduce((s, w) => s + w.activeKcal, 0);
  const workoutDone = todays.length > 0;
  const moveRing = Math.min(1, moveKcal / (settings.goals.moveKcal || 600));

  // Mind: journaled today
  const journalDone = journals.some((j) => j.date === today);
  const mindRing = journalDone ? 1 : 0;

  // Weighted blend (sums to 1). Habits & movement weigh most.
  const score = Math.round(
    100 * (habitsRing * 0.3 + waterRing * 0.2 + tasksRing * 0.2 + moveRing * 0.2 + mindRing * 0.1),
  );

  return {
    score: Math.min(100, score),
    rings: { habits: habitsRing, water: waterRing, tasks: tasksRing, move: moveRing, mind: mindRing },
    done: {
      habits: [habitsDone, scheduled.length],
      waterPct: Math.round(waterRing * 100),
      tasks: tasksClosed,
      workout: workoutDone,
      journal: journalDone,
    },
  };
}

export type StellaMood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

export function stellaMood(score: number): StellaMood {
  if (score >= 80) return 'starstruck';
  if (score >= 45) return 'happy';
  if (score >= 15) return 'neutral';
  return 'sleepy';
}

/** i18n key for an encouraging, non-punishing message based on score. */
export function momentumMessageKey(score: number): string {
  if (score >= 80) return 'momentum.msg.great';
  if (score >= 45) return 'momentum.msg.good';
  if (score >= 15) return 'momentum.msg.start';
  return 'momentum.msg.idle';
}

// ---------------------------------------------------------------------------
// App-level "active day" streak — don't break the chain across the whole app.
// A day counts as active if momentum >= threshold. We persist lightweight state
// in localStorage (settings table stays clean).
// ---------------------------------------------------------------------------
const STREAK_KEY = 'vita.momentum.streak';
const ACTIVE_THRESHOLD = 30;

interface StreakState {
  count: number;
  lastActiveDate: string; // ISO
}

export function getStreakState(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as StreakState;
  } catch {
    /* ignore */
  }
  return { count: 0, lastActiveDate: '' };
}

/** Call when momentum updates; returns the current active-day streak. */
export function updateStreak(score: number): number {
  const today = todayISO();
  const st = getStreakState();
  if (st.lastActiveDate === today) return st.count; // already counted today
  if (score < ACTIVE_THRESHOLD) return st.count; // not active enough yet

  // Was yesterday active? If the gap is exactly 1 day, continue; else reset to 1.
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yIso = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  const count = st.lastActiveDate === yIso ? st.count + 1 : 1;
  const next: StreakState = { count, lastActiveDate: today };
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return count;
}
