import type { Task, TaskStatus } from '@/data/types';
import { todayISO, isOverdue } from '@/lib/format';
import { parseISO, isThisWeek } from 'date-fns';

export type QuickView = 'today' | 'week' | 'inbox' | 'completed' | 'all';

export function projectProgress(tasks: Task[], projectId: string): number {
  const list = tasks.filter((t) => t.projectId === projectId);
  if (list.length === 0) return 0;
  const done = list.filter((t) => t.status === 'done').length;
  return done / list.length;
}

export function projectCounts(tasks: Task[], projectId: string): { open: number; total: number } {
  const list = tasks.filter((t) => t.projectId === projectId);
  return { open: list.filter((t) => t.status !== 'done').length, total: list.length };
}

export function filterByView(tasks: Task[], view: QuickView): Task[] {
  const today = todayISO();
  switch (view) {
    case 'today':
      return tasks.filter((t) => t.status !== 'done' && (t.dueDate === today || (t.dueDate && isOverdue(t.dueDate))));
    case 'week':
      return tasks.filter((t) => t.status !== 'done' && t.dueDate && isThisWeek(parseISO(t.dueDate), { weekStartsOn: 1 }));
    case 'inbox':
      return tasks.filter((t) => !t.projectId && t.status !== 'done');
    case 'completed':
      return tasks.filter((t) => t.status === 'done');
    case 'all':
      return tasks.filter((t) => t.status !== 'done');
  }
}

const priorityRank = { high: 0, medium: 1, low: 2 };

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // overdue/with due first, then priority, then order
    if (!!a.dueDate !== !!b.dueDate) return a.dueDate ? -1 : 1;
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    if (a.priority !== b.priority) return priorityRank[a.priority] - priorityRank[b.priority];
    return a.order - b.order;
  });
}

// Column order for the kanban board. Labels are localized in the UI via
// COLUMN_LABEL_KEYS (kanban.todo/doing/done), not stored here.
export const STATUS_COLUMNS: { id: TaskStatus }[] = [
  { id: 'todo' },
  { id: 'doing' },
  { id: 'done' },
];

export function subtaskProgress(task: Task): { done: number; total: number } {
  return { done: task.subtasks.filter((s) => s.done).length, total: task.subtasks.length };
}
