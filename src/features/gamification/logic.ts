// ============================================================================
// Gamification — levels, achievements (badges) and weekly challenges, all
// derived from the data the user already has. No extra storage: everything is
// computed from habits/tasks/workouts/water/journal so it can never desync.
// ============================================================================
import { subDays, startOfDay, getDay } from 'date-fns';
import type { Habit, HabitLog, JournalEntry, Settings, Task, WaterLog, WeightLog, Workout } from '@/data/types';
import { isScheduled, currentStreak } from '@/features/abitudini/logic';
import { todayISO } from '@/lib/format';

export interface LifeData {
  settings: Settings;
  habits: Habit[];
  logs: HabitLog[];
  tasks: Task[];
  workouts: Workout[];
  waters: WaterLog[];
  journals: JournalEntry[];
  weights: WeightLog[];
}

// ---------------------------------------------------------------------------
// Points
// ---------------------------------------------------------------------------
const PTS = { habit: 2, task: 3, workout: 8, journal: 3, waterDay: 5, weigh: 2 } as const;

/** Points earned on a specific ISO day (used for the Daily Win comparison). */
export function dayPoints(d: LifeData, dateISO: string): number {
  const dayStart = startOfDay(new Date(dateISO)).getTime();
  const dayEnd = dayStart + 86_400_000;
  const goalMl = d.settings.water.dailyGoalMl || 2000;

  const habits = d.logs.filter((l) => l.done && l.date === dateISO).length;
  const tasks = d.tasks.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd).length;
  const workouts = d.workouts.filter((w) => w.startedAt >= dayStart && w.startedAt < dayEnd).length;
  const journal = d.journals.some((j) => j.date === dateISO) ? 1 : 0;
  const water = (d.waters.find((w) => w.date === dateISO)?.ml ?? 0) >= goalMl ? 1 : 0;
  const weigh = d.weights.some((w) => w.date === dateISO) ? 1 : 0;

  return habits * PTS.habit + tasks * PTS.task + workouts * PTS.workout + journal * PTS.journal + water * PTS.waterDay + weigh * PTS.weigh;
}

/** Lifetime total points across all data. */
export function lifetimePoints(d: LifeData): number {
  const goalMl = d.settings.water.dailyGoalMl || 2000;
  const habits = d.logs.filter((l) => l.done).length * PTS.habit;
  const tasks = d.tasks.filter((t) => t.status === 'done').length * PTS.task;
  const workouts = d.workouts.length * PTS.workout;
  const journal = d.journals.length * PTS.journal;
  const waterDays = d.waters.filter((w) => w.ml >= goalMl).length * PTS.waterDay;
  const weigh = d.weights.length * PTS.weigh;
  return habits + tasks + workouts + journal + waterDays + weigh;
}

// ---------------------------------------------------------------------------
// Levels
// ---------------------------------------------------------------------------
export interface LevelInfo {
  level: number;
  titleKey: string; // i18n key
  into: number; // points accumulated inside the current level
  span: number; // points needed to clear the current level
  progress: number; // 0..1 toward next level
  toNext: number; // points remaining
  max: boolean;
}

const LEVEL_THRESHOLDS = [0, 100, 300, 700, 1500, 3000, 6000];
const LEVEL_TITLES = [
  'level.title.1',
  'level.title.2',
  'level.title.3',
  'level.title.4',
  'level.title.5',
  'level.title.6',
  'level.title.7',
];

export function computeLevel(points: number): LevelInfo {
  let i = 0;
  while (i + 1 < LEVEL_THRESHOLDS.length && points >= LEVEL_THRESHOLDS[i + 1]) i++;
  const base = LEVEL_THRESHOLDS[i];
  const max = i === LEVEL_THRESHOLDS.length - 1;
  const next = max ? base : LEVEL_THRESHOLDS[i + 1];
  const span = max ? 1 : next - base;
  const into = points - base;
  return {
    level: i + 1,
    titleKey: LEVEL_TITLES[i],
    into,
    span,
    progress: max ? 1 : into / span,
    toNext: max ? 0 : next - points,
    max,
  };
}

// ---------------------------------------------------------------------------
// Distinct active days (any meaningful activity) — used for streak badges.
// ---------------------------------------------------------------------------
function activeDays(d: LifeData): Set<string> {
  const days = new Set<string>();
  d.logs.filter((l) => l.done).forEach((l) => days.add(l.date));
  d.journals.forEach((j) => days.add(j.date));
  d.waters.filter((w) => w.ml > 0).forEach((w) => days.add(w.date));
  d.weights.forEach((w) => days.add(w.date));
  d.workouts.forEach((w) => days.add(todayISO(new Date(w.startedAt))));
  d.tasks.filter((t) => t.status === 'done' && t.completedAt).forEach((t) => days.add(todayISO(new Date(t.completedAt!))));
  return days;
}

// ---------------------------------------------------------------------------
// Achievements (badges)
// ---------------------------------------------------------------------------
export interface Achievement {
  id: string;
  emoji: string;
  titleKey: string;
  descKey: string;
  earned: boolean;
  progress: number; // 0..1
}

function ach(id: string, emoji: string, value: number, target: number): Achievement {
  return {
    id,
    emoji,
    titleKey: `badge.${id}.title`,
    descKey: `badge.${id}.desc`,
    earned: value >= target,
    progress: Math.min(1, target ? value / target : 0),
  };
}

export function computeAchievements(d: LifeData): Achievement[] {
  const days = activeDays(d).size;
  const habitDone = d.logs.filter((l) => l.done).length;
  const tasksDone = d.tasks.filter((t) => t.status === 'done').length;
  const workouts = d.workouts.length;
  const morning = d.workouts.filter((w) => new Date(w.startedAt).getHours() < 9).length;
  const journals = d.journals.length;
  const goalMl = d.settings.water.dailyGoalMl || 2000;
  const hydratedDays = d.waters.filter((w) => w.ml >= goalMl).length;
  const bestHabitStreak = Math.max(0, ...d.habits.filter((h) => !h.archived).map((h) => currentStreak(h, d.logs)));

  return [
    ach('firstStep', '🌱', days, 1),
    ach('firstWeek', '🏆', days, 7),
    ach('streak30', '🔥', bestHabitStreak, 30),
    ach('morningMaster', '🌅', morning, 5),
    ach('hydrated', '💧', hydratedDays, 7),
    ach('bookworm', '📖', journals, 10),
    ach('athlete', '🏃', workouts, 20),
    ach('centurion', '💯', habitDone, 100),
    ach('taskMaster', '✅', tasksDone, 50),
  ];
}

// ---------------------------------------------------------------------------
// Weekly challenges — reset every Monday, measured over the last 7 days.
// ---------------------------------------------------------------------------
export interface Challenge {
  id: string;
  emoji: string;
  titleKey: string;
  value: number;
  target: number;
  done: boolean;
}

function weekDays(): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < 7; i++) set.add(todayISO(subDays(new Date(), i)));
  return set;
}

export function computeChallenges(d: LifeData): Challenge[] {
  const week = weekDays();
  const from = startOfDay(subDays(new Date(), 6)).getTime();
  const goalMl = d.settings.water.dailyGoalMl || 2000;

  const hydrationDays = d.waters.filter((w) => week.has(w.date) && w.ml >= goalMl).length;
  const habitDaysSet = new Set(d.logs.filter((l) => l.done && week.has(l.date)).map((l) => l.date));
  const workoutsThisWeek = d.workouts.filter((w) => w.startedAt >= from).length;
  const journalThisWeek = d.journals.filter((j) => week.has(j.date)).length;
  const tasksThisWeek = d.tasks.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= from).length;

  const make = (id: string, emoji: string, value: number, target: number): Challenge => ({
    id,
    emoji,
    titleKey: `challenge.${id}`,
    value: Math.min(value, target),
    target,
    done: value >= target,
  });

  return [
    make('hydration', '💧', hydrationDays, 7),
    make('consistency', '🔥', habitDaysSet.size, 5),
    make('active', '🏃', workoutsThisWeek, 3),
    make('journaling', '📖', journalThisWeek, 4),
    make('focus', '✅', tasksThisWeek, 10),
  ];
}

/** Which weekday the user is most consistent on (0=Sun..6=Sat), or null. */
export function mostConsistentWeekday(d: LifeData): number | null {
  if (!d.logs.some((l) => l.done)) return null;
  const counts = new Array(7).fill(0);
  for (const l of d.logs) {
    if (l.done && d.habits.some((h) => h.id === l.habitId && isScheduled(h, l.date))) {
      counts[getDay(new Date(l.date))]++;
    }
  }
  let best = 0;
  for (let i = 1; i < 7; i++) if (counts[i] > counts[best]) best = i;
  return counts[best] > 0 ? best : null;
}
