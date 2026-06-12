// ============================================================================
// Repositories — the only business-data API the UI calls.
// No business logic lives in components; it lives here.
// ============================================================================
import { db, now, uid } from './db';
import { defaultSettings } from './defaults';
import { ALL_MODULES } from './types';
import type {
  Budget,
  Goal,
  Habit,
  HabitLog,
  HomeLayout,
  JournalEntry,
  ModuleId,
  Note,
  NoteChecklistItem,
  Project,
  Settings,
  Subtask,
  Task,
  Transaction,
  VitaBackup,
  WaterLog,
  WeightLog,
  WidgetInstance,
  Workout,
} from './types';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function getSettings(): Promise<Settings> {
  let s = await db.settings.get('app');
  if (!s) {
    s = defaultSettings();
    await db.settings.put(s);
  }
  return s;
}

/** Read-only settings accessor safe to use inside Dexie liveQuery. */
export async function readSettings(): Promise<Settings> {
  return (await db.settings.get('app')) ?? defaultSettings();
}

/** New modules introduced after launch that should auto-enable for existing
 *  users (so they appear without the user re-onboarding). */
const AUTO_ENABLE_MODULES: ModuleId[] = ['note', 'attivita'];

/** One-time nav reorder: bump this when the canonical tab order changes so
 *  existing devices pick it up (their saved moduleOrder predates it). */
const NAV_ORDER_VERSION = 'v2';
const NAV_ORDER_KEY = 'vita.navOrder';

/** Ensure singleton rows exist. Call once at app startup (outside liveQuery). */
export async function ensureSeedRows(): Promise<void> {
  if (!(await db.settings.get('app'))) await db.settings.put(defaultSettings());
  if (!(await db.budgets.get('monthly'))) await db.budgets.put({ id: 'monthly', monthlyLimit: 0, updatedAt: now() });

  // Migration: surface newly-shipped modules for users who already onboarded
  // (their saved enabledModules predates the module, so it would stay hidden).
  const s = await db.settings.get('app');
  if (s?.enabledModules && AUTO_ENABLE_MODULES.some((m) => !s.enabledModules!.includes(m))) {
    const missing = AUTO_ENABLE_MODULES.filter((m) => !s.enabledModules!.includes(m));
    await db.settings.put({
      ...s,
      enabledModules: [...s.enabledModules, ...missing],
      moduleOrder: [...(s.moduleOrder ?? s.enabledModules), ...missing],
      updatedAt: now(),
    });
  }

  // One-time migration: re-sort the saved moduleOrder to the new canonical
  // order (tabs = abitudini · salute · note · progetti) on existing devices.
  try {
    if (localStorage.getItem(NAV_ORDER_KEY) !== NAV_ORDER_VERSION) {
      const cur = await db.settings.get('app');
      if (cur?.moduleOrder?.length) {
        const sorted = [...cur.moduleOrder].sort((a, b) => ALL_MODULES.indexOf(a) - ALL_MODULES.indexOf(b));
        await db.settings.put({ ...cur, moduleOrder: sorted, updatedAt: now() });
      }
      localStorage.setItem(NAV_ORDER_KEY, NAV_ORDER_VERSION);
    }
  } catch {
    /* localStorage unavailable — skip */
  }
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const s = await getSettings();
  await db.settings.put({ ...s, ...patch, updatedAt: now() });
}

// ---------------------------------------------------------------------------
// Personalisation — enabled modules / interests
// ---------------------------------------------------------------------------
export async function setEnabledModules(ids: ModuleId[]): Promise<void> {
  const s = await getSettings();
  // Preserve any existing custom order; append newly enabled, drop disabled.
  const prevOrder = s.moduleOrder ?? ids;
  const order = [...prevOrder.filter((m) => ids.includes(m)), ...ids.filter((m) => !prevOrder.includes(m))];
  await db.settings.put({ ...s, enabledModules: ids, moduleOrder: order, updatedAt: now() });
}

export async function reorderModules(order: ModuleId[]): Promise<void> {
  const s = await getSettings();
  await db.settings.put({ ...s, moduleOrder: order, updatedAt: now() });
}

/** Completed at the end of onboarding: persists chosen interests + their order. */
export async function completeOnboarding(selected: ModuleId[], extra?: Partial<Settings>): Promise<void> {
  const s = await getSettings();
  await db.settings.put({ ...s, ...extra, enabledModules: selected, moduleOrder: selected, updatedAt: now() });
}

// ---------------------------------------------------------------------------
// Personalisation — Apple-style widget home (singleton row, id = 'home')
// ---------------------------------------------------------------------------
/** Read-only home layout accessor (safe inside liveQuery). Returns `null` (not
 *  `undefined`) when no layout has been saved, so callers can tell "still
 *  loading" (undefined) apart from "no custom layout yet" (null). */
export async function readHomeLayout(): Promise<HomeLayout | null> {
  return (await db.homeLayout.get('home')) ?? null;
}

export async function saveHomeLayout(widgets: WidgetInstance[]): Promise<void> {
  const normalised = widgets.map((w, i) => ({ ...w, position: i }));
  await db.homeLayout.put({ id: 'home', widgets: normalised, updatedAt: now() });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export async function createProject(data: Pick<Project, 'name' | 'color'> & Partial<Project>) {
  const t = now();
  const project: Project = {
    id: uid('prj_'),
    name: data.name,
    description: data.description,
    color: data.color,
    archived: false,
    externalUrl: data.externalUrl,
    createdAt: t,
    updatedAt: t,
  };
  await db.projects.put(project);
  return project;
}

export async function updateProject(id: string, patch: Partial<Project>) {
  const p = await db.projects.get(id);
  if (!p) return;
  await db.projects.put({ ...p, ...patch, updatedAt: now() });
}

export async function deleteProject(id: string) {
  // Tasks of the project fall back to Inbox (projectId cleared).
  const tasks = await db.tasks.where('projectId').equals(id).toArray();
  await db.transaction('rw', db.tasks, db.projects, async () => {
    for (const tk of tasks) {
      await db.tasks.put({ ...tk, projectId: undefined, updatedAt: now() });
    }
    await db.projects.delete(id);
  });
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export async function createTask(data: Partial<Task> & { title: string }) {
  const t = now();
  const task: Task = {
    id: uid('tsk_'),
    title: data.title,
    notes: data.notes,
    projectId: data.projectId,
    status: data.status ?? 'todo',
    priority: data.priority ?? 'medium',
    dueDate: data.dueDate,
    subtasks: data.subtasks ?? [],
    order: data.order ?? t,
    createdAt: t,
    updatedAt: t,
  };
  await db.tasks.put(task);
  return task;
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const tk = await db.tasks.get(id);
  if (!tk) return;
  const next: Task = { ...tk, ...patch, updatedAt: now() };
  if (patch.status) {
    next.completedAt = patch.status === 'done' ? now() : undefined;
  }
  await db.tasks.put(next);
}

export async function toggleTaskDone(id: string) {
  const tk = await db.tasks.get(id);
  if (!tk) return;
  const done = tk.status !== 'done';
  await updateTask(id, { status: done ? 'done' : 'todo' });
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id);
}

export function newSubtask(title: string): Subtask {
  return { id: uid('sub_'), title, done: false };
}

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------
export async function createHabit(data: Partial<Habit> & { name: string }) {
  const t = now();
  const habit: Habit = {
    id: uid('hbt_'),
    name: data.name,
    color: data.color ?? 'var(--c-habit)',
    icon: data.icon ?? 'CircleCheck',
    frequency: data.frequency ?? { type: 'daily' },
    reminder: data.reminder,
    archived: false,
    order: data.order ?? t,
    createdAt: t,
    updatedAt: t,
  };
  await db.habits.put(habit);
  return habit;
}

export async function updateHabit(id: string, patch: Partial<Habit>) {
  const h = await db.habits.get(id);
  if (!h) return;
  await db.habits.put({ ...h, ...patch, updatedAt: now() });
}

export async function deleteHabit(id: string) {
  await db.transaction('rw', db.habits, db.habitLogs, async () => {
    await db.habitLogs.where('habitId').equals(id).delete();
    await db.habits.delete(id);
  });
}

export async function setHabitLog(habitId: string, date: string, done: boolean) {
  const id = `${habitId}:${date}`;
  if (done) {
    const log: HabitLog = { id, habitId, date, done: true, createdAt: now() };
    await db.habitLogs.put(log);
  } else {
    await db.habitLogs.delete(id);
  }
}

export async function toggleHabitLog(habitId: string, date: string) {
  const id = `${habitId}:${date}`;
  const existing = await db.habitLogs.get(id);
  await setHabitLog(habitId, date, !existing?.done);
}

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------
export async function createWorkout(data: Partial<Workout> & { sportId: string; durationSec: number }) {
  const t = now();
  const workout: Workout = {
    id: uid('wkt_'),
    sportId: data.sportId,
    startedAt: data.startedAt ?? t,
    durationSec: data.durationSec,
    activeKcal: data.activeKcal ?? 0,
    totalKcal: data.totalKcal,
    distanceM: data.distanceM,
    avgPaceSecPerKm: data.avgPaceSecPerKm,
    avgHr: data.avgHr,
    maxHr: data.maxHr,
    elevationM: data.elevationM,
    note: data.note,
    source: data.source ?? 'manual',
    createdAt: t,
    updatedAt: t,
  };
  await db.workouts.put(workout);
  return workout;
}

export async function deleteWorkout(id: string) {
  await db.workouts.delete(id);
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------
export async function createJournalEntry(data: Partial<JournalEntry> & { date: string; mood: JournalEntry['mood'] }) {
  const t = now();
  const entry: JournalEntry = {
    id: uid('jrn_'),
    date: data.date,
    mood: data.mood,
    text: data.text ?? '',
    tags: data.tags ?? [],
    createdAt: t,
    updatedAt: t,
  };
  await db.journalEntries.put(entry);
  return entry;
}

export async function updateJournalEntry(id: string, patch: Partial<JournalEntry>) {
  const e = await db.journalEntries.get(id);
  if (!e) return;
  await db.journalEntries.put({ ...e, ...patch, updatedAt: now() });
}

export async function deleteJournalEntry(id: string) {
  await db.journalEntries.delete(id);
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------
export async function createNote(data: Partial<Note> = {}) {
  const t = now();
  const note: Note = {
    id: uid('not_'),
    title: data.title ?? '',
    body: data.body ?? '',
    checklist: data.checklist ?? [],
    color: data.color ?? '#e0992f',
    pinned: data.pinned ?? false,
    createdAt: t,
    updatedAt: t,
  };
  await db.notes.put(note);
  return note;
}

export async function updateNote(id: string, patch: Partial<Note>) {
  const n = await db.notes.get(id);
  if (!n) return;
  await db.notes.put({ ...n, ...patch, updatedAt: now() });
}

export async function deleteNote(id: string) {
  await db.notes.delete(id);
}

export async function toggleNotePin(id: string) {
  const n = await db.notes.get(id);
  if (!n) return;
  await db.notes.put({ ...n, pinned: !n.pinned, updatedAt: now() });
}

export function newChecklistItem(text = ''): NoteChecklistItem {
  return { id: uid('chk_'), text, done: false };
}

// ---------------------------------------------------------------------------
// Subscription (Vyta Pro) — cached entitlement for offline-first gating
// ---------------------------------------------------------------------------
export async function readSubscription(): Promise<import('./types').SubscriptionCache | null> {
  return (await db.subscription.get('sub')) ?? null;
}

export async function writeSubscription(data: { isPro: boolean; productId?: string; expiresAt?: number }): Promise<void> {
  await db.subscription.put({ id: 'sub', isPro: data.isPro, productId: data.productId, expiresAt: data.expiresAt, updatedAt: now() });
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------
export async function createGoal(data: Partial<Goal> & { title: string }) {
  const t = now();
  const goal: Goal = {
    id: uid('gol_'),
    title: data.title,
    description: data.description,
    targetDate: data.targetDate,
    manualProgress: data.manualProgress ?? 0,
    link: data.link ?? { type: 'none' },
    milestones: data.milestones ?? [],
    done: false,
    createdAt: t,
    updatedAt: t,
  };
  await db.goals.put(goal);
  return goal;
}

export async function updateGoal(id: string, patch: Partial<Goal>) {
  const g = await db.goals.get(id);
  if (!g) return;
  await db.goals.put({ ...g, ...patch, updatedAt: now() });
}

export async function deleteGoal(id: string) {
  await db.goals.delete(id);
}

// ---------------------------------------------------------------------------
// Finances
// ---------------------------------------------------------------------------
export async function createTransaction(data: Partial<Transaction> & { type: Transaction['type']; amount: number; category: string; date: string }) {
  const t = now();
  const tx: Transaction = {
    id: uid('txn_'),
    type: data.type,
    amount: data.amount,
    category: data.category,
    note: data.note,
    date: data.date,
    createdAt: t,
    updatedAt: t,
  };
  await db.transactions.put(tx);
  return tx;
}

export async function deleteTransaction(id: string) {
  await db.transactions.delete(id);
}

export async function getBudget(): Promise<Budget> {
  let b = await db.budgets.get('monthly');
  if (!b) {
    b = { id: 'monthly', monthlyLimit: 0, updatedAt: now() };
    await db.budgets.put(b);
  }
  return b;
}

/** Read-only budget accessor safe to use inside Dexie liveQuery. */
export async function readBudget(): Promise<Budget> {
  return (await db.budgets.get('monthly')) ?? { id: 'monthly', monthlyLimit: 0, updatedAt: 0 };
}

export async function setBudget(monthlyLimit: number) {
  await db.budgets.put({ id: 'monthly', monthlyLimit, updatedAt: now() });
}

// ---------------------------------------------------------------------------
// Water intake
// ---------------------------------------------------------------------------
export async function readWaterLog(date: string): Promise<WaterLog | undefined> {
  return db.waterLogs.get(date);
}

/** Add (or subtract) milliliters to the day's water total; never below 0. */
export async function addWaterMl(date: string, deltaMl: number) {
  const existing = await db.waterLogs.get(date);
  const ml = Math.max(0, (existing?.ml ?? 0) + deltaMl);
  await db.waterLogs.put({ id: date, date, ml, updatedAt: now() });
}

export async function setWaterMl(date: string, ml: number) {
  await db.waterLogs.put({ id: date, date, ml: Math.max(0, ml), updatedAt: now() });
}

// ---------------------------------------------------------------------------
// Body weight
// ---------------------------------------------------------------------------
export async function logWeight(data: { date: string; weightKg: number; note?: string; photo?: string }) {
  const existing = await db.weightLogs.get(data.date);
  const t = now();
  const entry: WeightLog = {
    id: data.date,
    date: data.date,
    weightKg: data.weightKg,
    note: data.note ?? existing?.note,
    photo: data.photo ?? existing?.photo,
    createdAt: existing?.createdAt ?? t,
    updatedAt: t,
  };
  await db.weightLogs.put(entry);
  // First-ever weigh-in seeds the start weight if unset.
  const s = await db.settings.get('app');
  if (s && s.body.startWeightKg == null) {
    await db.settings.put({ ...s, body: { ...s.body, startWeightKg: data.weightKg }, updatedAt: t });
  }
  return entry;
}

export async function deleteWeightLog(id: string) {
  await db.weightLogs.delete(id);
}

// ---------------------------------------------------------------------------
// Backup — export / import full state (BUILD-SPEC §5)
// ---------------------------------------------------------------------------
export async function exportBackup(): Promise<VitaBackup> {
  const [settings, projects, tasks, habits, habitLogs, workouts, journalEntries, goals, transactions, budgets, waterLogs, weightLogs, notes] =
    await Promise.all([
      db.settings.get('app'),
      db.projects.toArray(),
      db.tasks.toArray(),
      db.habits.toArray(),
      db.habitLogs.toArray(),
      db.workouts.toArray(),
      db.journalEntries.toArray(),
      db.goals.toArray(),
      db.transactions.toArray(),
      db.budgets.toArray(),
      db.waterLogs.toArray(),
      db.weightLogs.toArray(),
      db.notes.toArray(),
    ]);
  return {
    schema: 'vita',
    version: 3,
    exportedAt: now(),
    settings: settings ?? null,
    projects,
    tasks,
    habits,
    habitLogs,
    workouts,
    journalEntries,
    goals,
    transactions,
    budgets,
    waterLogs,
    weightLogs,
    notes,
  };
}

export async function importBackup(backup: VitaBackup, mode: 'replace' | 'merge' = 'replace') {
  if (backup.schema !== 'vita') throw new Error('File di backup non valido.');
  await db.transaction(
    'rw',
    [db.settings, db.projects, db.tasks, db.habits, db.habitLogs, db.workouts, db.journalEntries, db.goals, db.transactions, db.budgets, db.waterLogs, db.weightLogs, db.notes],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.settings.clear(),
          db.projects.clear(),
          db.tasks.clear(),
          db.habits.clear(),
          db.habitLogs.clear(),
          db.workouts.clear(),
          db.journalEntries.clear(),
          db.goals.clear(),
          db.transactions.clear(),
          db.budgets.clear(),
          db.waterLogs.clear(),
          db.weightLogs.clear(),
          db.notes.clear(),
        ]);
      }
      if (backup.settings) await db.settings.put(backup.settings);
      await db.projects.bulkPut(backup.projects ?? []);
      await db.tasks.bulkPut(backup.tasks ?? []);
      await db.habits.bulkPut(backup.habits ?? []);
      await db.habitLogs.bulkPut(backup.habitLogs ?? []);
      await db.workouts.bulkPut(backup.workouts ?? []);
      await db.journalEntries.bulkPut(backup.journalEntries ?? []);
      await db.goals.bulkPut(backup.goals ?? []);
      await db.transactions.bulkPut(backup.transactions ?? []);
      await db.budgets.bulkPut(backup.budgets ?? []);
      await db.waterLogs.bulkPut(backup.waterLogs ?? []);
      await db.weightLogs.bulkPut(backup.weightLogs ?? []);
      await db.notes.bulkPut(backup.notes ?? []);
    },
  );
}

export async function clearAllData() {
  await Promise.all([
    db.settings.clear(),
    db.projects.clear(),
    db.tasks.clear(),
    db.habits.clear(),
    db.habitLogs.clear(),
    db.workouts.clear(),
    db.journalEntries.clear(),
    db.goals.clear(),
    db.transactions.clear(),
    db.budgets.clear(),
    db.waterLogs.clear(),
    db.weightLogs.clear(),
    db.notes.clear(),
  ]);
}
