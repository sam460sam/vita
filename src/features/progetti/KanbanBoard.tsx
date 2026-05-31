import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { cn } from '@/lib/cn';
import { updateTask } from '@/data/repo';
import { dueLabel, isOverdue } from '@/lib/format';
import type { Project, Task, TaskStatus } from '@/data/types';
import { STATUS_COLUMNS, subtaskProgress } from './logic';
import { useT } from '@/i18n';
import type { TKey } from '@/i18n';

const COLUMN_LABEL_KEYS: Record<TaskStatus, TKey> = {
  todo: 'kanban.todo',
  doing: 'kanban.doing',
  done: 'kanban.done',
};

/** Lightweight HTML5 drag & drop kanban (works on desktop; cards also tappable). */
export function KanbanBoard({ tasks, project, onOpen }: { tasks: Task[]; project: Project; onOpen: (t: Task) => void }) {
  const t = useT();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  async function drop(status: TaskStatus) {
    if (dragId) {
      await updateTask(dragId, { status });
      setDragId(null);
      setOverCol(null);
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
      {STATUS_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order);
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.id);
            }}
            onDrop={() => drop(col.id)}
            className={cn(
              'w-[78vw] sm:w-64 flex-shrink-0 rounded-card p-2.5 transition-colors',
              overCol === col.id ? 'bg-section ring-2 ring-project/30' : 'bg-section/60',
            )}
          >
            <div className="flex items-center justify-between px-1.5 pb-2">
              <span className="text-[13px] font-semibold text-ink">{t(COLUMN_LABEL_KEYS[col.id])}</span>
              <span className="text-[12px] tnum text-ink-3">{colTasks.length}</span>
            </div>
            <div className="space-y-2 min-h-[40px]">
              {colTasks.map((task) => {
                const sub = subtaskProgress(task);
                const overdue = task.status !== 'done' && isOverdue(task.dueDate);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDragId(task.id)}
                    onClick={() => onOpen(task)}
                    className="bg-card rounded-xl p-3 shadow-card border border-line/60 border-l-[3px] cursor-pointer active:scale-[0.98] transition-transform"
                    style={{ borderLeftColor: project.color }}
                  >
                    <div className={cn('text-[14px] leading-snug', task.status === 'done' ? 'text-ink-3 line-through' : 'text-ink')}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-ink-2">
                      {task.dueDate && <span className={overdue ? 'text-danger font-medium' : ''}>{dueLabel(task.dueDate)}</span>}
                      {sub.total > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <CheckSquare size={11} /> {sub.done}/{sub.total}
                        </span>
                      )}
                      {task.priority === 'high' && <span className="text-danger font-medium">{t('taskForm.priority.high')}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
