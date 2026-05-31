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
export type GoalLinkType = 'none' | 'project' | 'habit';

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
}
