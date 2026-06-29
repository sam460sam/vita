// ============================================================================
// Daily "momentum" — a single cross-life score (0..100) that unifies progress
// across ALL modules. This is Vita's unique edge: no single-purpose app can do
// a whole-life score. Stella reacts to it (gentle, non-punishing à la Finch).
// ============================================================================
import { startOfDay } from 'date-fns';
import type { Habit, HabitLog, Settings, Task, WaterLog, Workout, JournalEntry, DayPlan, WorkoutSession } from '@/data/types';
import { todayISO } from '@/lib/format';
import { isScheduled, isDone } from '@/features/abitudini/logic';

// ---------------------------------------------------------------------------
// Explicit points model — the plant grows from real behaviour across modules.
// Tunable in one place so the gamification stays transparent and balanced.
// ---------------------------------------------------------------------------
export const MOMENTUM_POINTS = {
  habit: 5, // each habit completed today
  focus: 10, // today's focus (one important thing) done
  todo: 5, // each quick to-do done
  workout: 20, // a workout session finished today
  journal: 10, // a journal entry written today
  water: 10, // water daily goal reached
} as const;

export type MomentumKey = keyof typeof MOMENTUM_POINTS;
export interface MomentumPart { key: MomentumKey; points: number; n: number }

export interface Momentum {
  score: number; // 0..100 (sum of points, capped)
  points: number; // raw total before the cap
  breakdown: MomentumPart[]; // only contributors with points > 0
  rings: { habits: number; water: number; tasks: number; move: number; mind: number }; // each 0..1 (kept for legacy UIs)
  done: { habits: [number, number]; waterPct: number; tasks: number; workout: boolean; journal: boolean };
}

/** Compute today's momentum from current data. Explicit additive points, forgiving (caps at 100). */
export function computeMomentum(
  settings: Settings,
  habits: Habit[],
  logs: HabitLog[],
  tasks: Task[],
  workouts: Workout[],
  water: WaterLog | undefined,
  journals: JournalEntry[],
  extra?: { dayPlan?: DayPlan; sessions?: WorkoutSession[] },
): Momentum {
  const today = todayISO();
  const dayStart = startOfDay(new Date()).getTime();

  // Habits scheduled today
  const scheduled = habits.filter((h) => !h.archived && isScheduled(h, today));
  const habitsDone = scheduled.filter((h) => isDone(logs, h.id, today)).length;
  const habitsRing = scheduled.length ? habitsDone / scheduled.length : 0;

  // Today's focus + quick to-dos (from the day plan)
  const focusDone = !!(extra?.dayPlan?.intention?.trim() && extra.dayPlan.intentionDone);
  const todosDone = (extra?.dayPlan?.items ?? []).filter((i) => i.done).length;

  // Water
  const goalMl = settings.water.dailyGoalMl || 2000;
  const waterRing = Math.min(1, (water?.ml ?? 0) / goalMl);
  const waterGoal = waterRing >= 1;

  // Tasks closed today (relative to a soft daily target of 3)
  const tasksClosed = tasks.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= dayStart).length;
  const tasksRing = Math.min(1, tasksClosed / 3);

  // Movement: a finished workout session today, or an activity workout today.
  const sessionToday = (extra?.sessions ?? []).some((w) => w.finishedAt && w.finishedAt >= dayStart);
  const moveToday = workouts.filter((w) => w.startedAt >= dayStart);
  const moveKcal = moveToday.reduce((s, w) => s + w.activeKcal, 0);
  const workoutDone = sessionToday || moveToday.length > 0;
  const moveRing = Math.min(1, moveKcal / (settings.goals.moveKcal || 600));

  // Mind: journaled today
  const journalDone = journals.some((j) => j.date === today);
  const mindRing = journalDone ? 1 : 0;

  // Build the breakdown from explicit points.
  const P = MOMENTUM_POINTS;
  const parts: MomentumPart[] = [
    { key: 'habit', n: habitsDone, points: habitsDone * P.habit },
    { key: 'focus', n: focusDone ? 1 : 0, points: focusDone ? P.focus : 0 },
    { key: 'todo', n: todosDone, points: todosDone * P.todo },
    { key: 'workout', n: workoutDone ? 1 : 0, points: workoutDone ? P.workout : 0 },
    { key: 'journal', n: journalDone ? 1 : 0, points: journalDone ? P.journal : 0 },
    { key: 'water', n: waterGoal ? 1 : 0, points: waterGoal ? P.water : 0 },
  ];
  const points = parts.reduce((s, p) => s + p.points, 0);

  return {
    score: Math.min(100, points),
    points,
    breakdown: parts.filter((p) => p.points > 0),
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
