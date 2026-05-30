import { CheckSquare } from 'lucide-react';
import { Checkbox, PriorityBadge } from '@/ui';
import { cn } from '@/lib/cn';
import { dueLabel, isOverdue } from '@/lib/format';
import { toggleTaskDone } from '@/data/repo';
import type { Project, Task } from '@/data/types';
import { subtaskProgress } from './logic';

export function TaskRow({ task, project, onOpen }: { task: Task; project?: Project; onOpen: (t: Task) => void }) {
  const done = task.status === 'done';
  const sub = subtaskProgress(task);
  const overdue = !done && isOverdue(task.dueDate);

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Checkbox checked={done} color={project?.color ?? 'var(--c-ink)'} onChange={() => toggleTaskDone(task.id)} label={task.title} />
      <button onClick={() => onOpen(task)} className="min-w-0 flex-1 text-left">
        <div className={cn('text-[15px] leading-tight truncate', done ? 'text-ink-3 line-through' : 'text-ink')}>{task.title}</div>
        <div className="flex items-center gap-2 mt-0.5 text-[12px] text-ink-2">
          {project && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.color }} />
              {project.name}
            </span>
          )}
          {task.dueDate && <span className={overdue ? 'text-danger font-medium' : ''}>{dueLabel(task.dueDate)}</span>}
          {sub.total > 0 && (
            <span className="inline-flex items-center gap-1">
              <CheckSquare size={12} /> {sub.done}/{sub.total}
            </span>
          )}
        </div>
      </button>
      {!done && task.priority === 'high' && <PriorityBadge priority="high" />}
    </div>
  );
}
