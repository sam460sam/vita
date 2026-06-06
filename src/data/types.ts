// ============================================================================
// Vita data model — strong types for every entity (BUILD-SPEC §5)
// Every record has a stable string id + createdAt/updatedAt (epoch ms).
// ============================================================================

export type ID = string;

export interface Timestamped {
  id: ID;
  createdAt: number;
  updatedAt: number;
}

/** Source of health/activity data — ready for HealthKit / Health Connect. */
export type DataSource = 'manual' | 'healthkit' | 'healthconnect';

// ----------------------------------------------------------------------------
// Personalisation — interests (modules) + Apple-style widget home
// ----------------------------------------------------------------------------
/** Toggleable "interest" sections (map 1:1 to navigable module routes). */
export type ModuleId =
  | 'attivita'
  | 'peso'
  | 'progetti'
  | 'abitudini'
  | 'finanze'
  | 'diario'
  | 'obiettivi'
  | 'calendario';

/** All known modules in canonical order — single source of truth. */
export const ALL_MODULES: ModuleId[] = [
  'abitudini',
  'attivita',
  'peso',
  'progetti',
  'obiettivi',
  'diario',
  'finanze',
  'calendario',
];

export type WidgetType =
  | 'momentum'
  | 'activity-rings'
  | 'water'
  | 'fasting'
  | 'weight-trend'
  | 'habit-streak'
  | 'consistency-heatmap'
  | 'daily-todo'
  | 'upcoming-tasks'
  | 'finance-balance'
  | 'journal-last'
  | 'goals-progress'
  | 'rewards'
  | 'quick-actions'
  | 'affirmation';

export type WidgetSize = 'small' | 'medium' | 'large'; // 1x1 · 2x1 · 2x2 (Apple-style)

export interface WidgetInstance {
  id: string; // uuid generated on add
  type: WidgetType;
  size: WidgetSize;
  position: number; // order in the home grid
  config?: Record<string, unknown>;
}

/** Singleton row holding the user's composed home dashboard. */
export interface HomeLayout {
  id: 'home';
  widgets: WidgetInstance[];
  updatedAt: number;
}

// ----------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------
export interface Settings {
  id: 'app'; // single row
  name: string; // user display name for greeting
  // Daily activity ring goals
  goals: {
    moveKcal: number; // active calories
    exerciseMin: number; // workout minutes
    standHours: number; // stand hours
  };
  // Feature toggles for additional modules
  modules: {
    goals: boolean;
    finances: boolean;
    calendar: boolean;
  };
  currency: string; // e.g. 'EUR'
  // Water tracking preferences (all volumes in milliliters)
  water: {
    dailyGoalMl: number; // daily target in ml (e.g. 2000)
    glassMl: number; // size of one "glass" in ml (default 200)
  };
  // Daily reminder times (HH:mm) — empty string = off. Fire as local
  // notifications on the native app; stored regardless on web.
  reminders: {
    water?: string;
    workout?: string;
    journal?: string;
    weight?: string;
    /** evening momentum check-in (e.g. "close your day") */
    evening?: string;
    /** low-pressure motivational nudge / affirmation */
    motivation?: string;
  };
  // Body / weight tracking
  body: {
    heightCm?: number; // for BMI
    startWeightKg?: number; // baseline for progress
    goalWeightKg?: number; // target weight
    unit: 'kg' | 'lb';
  };
  /** What the user mainly wants from Vita (set in onboarding). Drives nudges. */
  focus?: 'health' | 'productivity' | 'wellbeing' | 'all';
  /**
   * Personalisation — the modules the user chose as interests, and their order
   * in navigation. `undefined` means "not chosen yet" → treated as all enabled
   * (keeps existing users with no regression).
   */
  enabledModules?: ModuleId[];
  moduleOrder?: ModuleId[];
  createdAt: number;
  updatedAt: number;
}

// ----------------------------------------------------------------------------
// Projects & Tasks
// ----------------------------------------------------------------------------
export interface Project extends Timestamped {
  name: string;
  description?: string;
  color: string; // hex accent
  archived: boolean;
  /** Optional external link (Notion, Google Docs, etc.) for deeper note-taking. */
  externalUrl?: string;
}

export type TaskStatus = 'todo' | 'doing' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: ID;
  title: string;
  done: boolean;
}

export interface Task extends Timestamped {
  title: string;
  notes?: string;
  projectId?: ID; // undefined = Inbox
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO yyyy-MM-dd
  subtasks: Subtask[];
  order: number; // ordering within column/list
  completedAt?: number;
}

// ----------------------------------------------------------------------------
// Habits
// ----------------------------------------------------------------------------
export type HabitFrequencyType = 'daily' | 'times_per_week' | 'specific_days';

export interface HabitFrequency {
  type: HabitFrequencyType;
  timesPerWeek?: number; // for times_per_week
  days?: number[]; // for specific_days: 0=Sun..6=Sat
}

export interface Habit extends Timestamped {
  name: string;
  color: string;
  icon: string; // lucide icon name
  frequency: HabitFrequency;
  reminder?: string; // HH:mm (UI flag only, no server push)
  archived: boolean;
  order: number;
}

export interface HabitLog {
  id: ID; // `${habitId}:${date}`
  habitId: ID;
  date: string; // ISO yyyy-MM-dd
  done: boolean;
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Water intake
// ----------------------------------------------------------------------------
/** One day's total water intake, stored in milliliters. */
export interface WaterLog {
  id: ID; // = date (yyyy-MM-dd), one row per day
  date: string;
  ml: number; // total intake for the day in milliliters
  updatedAt: number;
}

// ----------------------------------------------------------------------------
// Body weight (Activity → Weight tracker)
// ----------------------------------------------------------------------------
export interface WeightLog extends Timestamped {
  date: string; // ISO yyyy-MM-dd (one entry per day; latest wins)
  weightKg: number; // always stored in kg internally
  note?: string;
  /** optional progress photo as a data URL (kept local, like all data) */
  photo?: string;
}

// ----------------------------------------------------------------------------
// Workouts (Activity)
// ----------------------------------------------------------------------------
export interface Workout extends Timestamped {
  sportId: string; // key into SPORTS config
  startedAt: number; // epoch ms
  durationSec: number;
  activeKcal: number;
  totalKcal?: number;
  distanceM?: number; // meters
  avgPaceSecPerKm?: number;
  avgHr?: number;
  maxHr?: number;
  elevationM?: number;
  note?: string;
  source: DataSource;
}

// ----------------------------------------------------------------------------
// Journal & Mood
// ----------------------------------------------------------------------------
/** 1 = terrible … 5 = great */
export type Mood = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry extends Timestamped {
  date: string; // ISO yyyy-MM-dd (one primary entry per day, but multiple allowed)
  mood: Mood;
  text: string;
  tags: string[];
}

// ----------------------------------------------------------------------------
// Goals
// ----------------------------------------------------------------------------
export type GoalLinkType = 'none' | 'project' | 'habit' | 'milestones';

/** A step/section of a future goal. */
export interface Milestone {
  id: ID;
  title: string;
  done: boolean;
}

export interface Goal extends Timestamped {
  title: string;
  description?: string;
  targetDate?: string; // ISO
  // Manual progress (0..1) used when not linked
  manualProgress: number;
  link: {
    type: GoalLinkType;
    refId?: ID; // projectId or habitId
  };
  // Steps/sections for a future project goal; progress = done/total
  milestones: Milestone[];
  done: boolean;
}

// ----------------------------------------------------------------------------
// Finances
// ----------------------------------------------------------------------------
export type TxType = 'income' | 'expense';

export interface Transaction extends Timestamped {
  type: TxType;
  amount: number; // positive number, sign derived from type
  category: string;
  note?: string;
  date: string; // ISO yyyy-MM-dd
}

export interface Budget {
  id: string; // 'monthly'
  monthlyLimit: number;
  updatedAt: number;
}

// ----------------------------------------------------------------------------
// Cantiere — cement flooring contractor
// ----------------------------------------------------------------------------
export type CantiereStato = 'preventivo' | 'confermato' | 'in_corso' | 'completato' | 'contestato';
export type PagamentoStato = 'da_pagare' | 'parziale' | 'saldato';
export type TipoUso = 'industriale' | 'residenziale' | 'esterno' | 'garage' | 'altro';

export interface Cantiere extends Timestamped {
  cliente: string;
  telefono?: string;
  indirizzo?: string;
  mq: number;
  spessore: number;          // cm
  tipoUso: TipoUso;
  stato: CantiereStato;
  importo: number;           // €
  acconto?: number;
  dataPrevista?: string;     // ISO yyyy-MM-dd
  dataCompletamento?: string;
  note?: string;
  foto: string[];            // base64 data URLs
  firmaCliente?: string;     // base64 canvas image
  operaiIds: string[];
  pagamento: PagamentoStato;
  scadenzaPagamento?: string;
  dataPagamento?: string;
  classeCemento?: string;
  additivi: string[];
  // Verbale legal metadata
  verbaleTimestamp?: string;        // ISO datetime when client signed
  verbaleClienteNome?: string;      // client name confirmed at signing
  verbaleDisclaimerAccettato?: boolean;
}

export interface Operaio extends Timestamped {
  nome: string;
  telefono?: string;
  specializzazioni: string[];
  valutazione?: 1 | 2 | 3 | 4 | 5;
  notePrivate?: string;
  attivo: boolean;
}

// ----------------------------------------------------------------------------
// Full export shape (backup)
// ----------------------------------------------------------------------------
export interface VitaBackup {
  schema: 'vita';
  version: number;
  exportedAt: number;
  settings: Settings | null;
  projects: Project[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  workouts: Workout[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  transactions: Transaction[];
  budgets: Budget[];
  waterLogs?: WaterLog[];
  weightLogs?: WeightLog[];
}
