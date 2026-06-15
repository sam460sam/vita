// ============================================================================
// Storage layer — Dexie/IndexedDB behind a single module.
// Capacitor-ready: the UI never touches Dexie directly; it goes through the
// repositories (repo.ts). Swapping this for native SQLite later means
// reimplementing only this file + repo.ts, not the UI.
// ============================================================================
import Dexie, { type Table } from 'dexie';
import type {
  Budget,
  Cantiere,
  GiornaleEntry,
  Goal,
  Habit,
  HabitLog,
  HomeLayout,
  JournalEntry,
  Note,
  NoteProject,
  Operaio,
  OutboxEntry,
  Project,
  Settings,
  Task,
  Transaction,
  WaterLog,
  WeightLog,
  WorkDay,
  WorkProfile,
  Workout,
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
  cantieri!: Table<Cantiere, string>;
  operai!: Table<Operaio, string>;
  giornaleEntries!: Table<GiornaleEntry, string>;
  workDays!: Table<WorkDay, string>;
  workProfiles!: Table<WorkProfile, string>;
  notes!: Table<Note, string>;
  noteProjects!: Table<NoteProject, string>;
  outbox!: Table<OutboxEntry, string>;

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
    // v5: cantiere — cement flooring contractor module.
    this.version(5).stores({
      cantieri: 'id, stato, pagamento, dataPrevista, updatedAt',
      operai: 'id, attivo, updatedAt',
    });
    // v6: giornale di cantiere — daily construction log.
    this.version(6).stores({
      giornaleEntries: 'id, cantiereId, data, updatedAt',
    });
    // v7: ore lavoro — work hours tracking with role-based workflow.
    this.version(7).stores({
      workDays: 'id, data, status, workerId, updatedAt',
      workProfiles: 'id',
    });
    // v8: note — timeline notes linked to projects and cantieri.
    this.version(8).stores({
      notes: 'id, projectId, data, inAgenda, cantiereId, updatedAt',
      noteProjects: 'id, cantiereId, updatedAt',
    });
    // v9: offline-first — aggiunge teamId agli indici di cantieri/operai per
    // interrogazioni per-team senza passare per Supabase. Aggiunge la tabella
    // outbox per la coda di scritture offline.
    this.version(9).stores({
      cantieri:       'id, stato, pagamento, dataPrevista, updatedAt, teamId',
      operai:         'id, attivo, updatedAt, teamId',
      outbox:         'id, table, teamId, createdAt',
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
