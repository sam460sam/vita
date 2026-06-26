// ============================================================================
// Storage layer — Dexie/IndexedDB behind a single module.
// Capacitor-ready: the UI never touches Dexie directly; it goes through the
// repositories (repo.ts). Swapping this for native SQLite later means
// reimplementing only this file + repo.ts, not the UI.
// ============================================================================
import Dexie, { type Table } from 'dexie';
import type {
  Budget,
  DayPlan,
  Goal,
  Habit,
  HabitLog,
  HomeLayout,
  JournalEntry,
  Note,
  PersonalityResult,
  Project,
  Routine,
  Settings,
  SubscriptionCache,
  Task,
  Transaction,
  WaterLog,
  WeightLog,
  Workout,
  WorkoutSession,
} from './types';

export class VitaDB extends Dexie {
  settings!: Table<Settings, string>;
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, string>;
  workouts!: Table<Workout, string>;
  journalEntries!: Table<JournalEntry, string>;
  goals!: Table<Goal, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  waterLogs!: Table<WaterLog, string>;
  weightLogs!: Table<WeightLog, string>;
  homeLayout!: Table<HomeLayout, string>;
  notes!: Table<Note, string>;
  subscription!: Table<SubscriptionCache, string>;
  personality!: Table<PersonalityResult, string>;
  dayPlans!: Table<DayPlan, string>;
  routines!: Table<Routine, string>;
  workoutSessions!: Table<WorkoutSession, string>;

  constructor() {
    super('vita');
    this.version(1).stores({
      settings: 'id',
      projects: 'id, archived, updatedAt',
      tasks: 'id, projectId, status, dueDate, order, updatedAt',
      habits: 'id, archived, order',
      habitLogs: 'id, habitId, date',
      workouts: 'id, sportId, startedAt',
      journalEntries: 'id, date',
      goals: 'id, done, targetDate',
      transactions: 'id, type, category, date',
      budgets: 'id',
    });
    // v2: water tracking
    this.version(2).stores({
      waterLogs: 'id, date',
    });
    // v3: body weight tracking
    this.version(3).stores({
      weightLogs: 'id, date',
    });
    // v4: personalisation — Apple-style widget home (singleton row).
    // Additive only; all existing tables and data are preserved.
    this.version(4).stores({
      homeLayout: 'id',
    });
    // v5: native notes (with optional checklist). Additive only.
    this.version(5).stores({
      notes: 'id, pinned, updatedAt',
    });
    // v6: cached subscription entitlement (offline-first paywall).
    this.version(6).stores({
      subscription: 'id',
    });
    // v7: personality test result (singleton row).
    this.version(7).stores({
      personality: 'id',
    });
    // v8: "plan your day" — intention + quick to-dos, keyed by date. Additive only.
    this.version(8).stores({
      dayPlans: 'date',
    });
    // v9: Fabulous-style routines. Additive only.
    this.version(9).stores({
      routines: 'id, order',
    });
    // v10: strength-training workout sessions. Additive only.
    this.version(10).stores({
      workoutSessions: 'id, date, createdAt',
    });
  }
}

export const db = new VitaDB();

/** Generate a stable, sortable-ish unique id without external deps. */
export function uid(prefix = ''): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}${t}${r}`;
}

export const now = () => Date.now();
