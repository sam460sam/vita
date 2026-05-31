import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil, Plus, Link as LinkIcon } from 'lucide-react';
import { db } from '@/data/db';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Segmented, EmptyState, Button, IconButton, ProgressRing } from '@/ui';
import { TaskForm } from './TaskForm';
import { ProjectForm } from './ProjectForm';
import { TaskRow } from './TaskRow';
import { KanbanBoard } from './KanbanBoard';
import { projectProgress, sortTasks } from './logic';
import type { Task } from '@/data/types';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n';

export function ProjectDetailPage() {
  const t = useT();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const project = useLiveQuery(() => db.projects.get(id), [id], undefined);
  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals(id).toArray(), [id], []);
  const [mode, setMode] = useState<'list' | 'kanban'>('list');
  const [taskForm, setTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projForm, setProjForm] = useState(false);

  if (project === undefined) return null; // loading
  if (!project) {
    return (
      <>
        <PageHeader title="Progetto" back="/progetti" />
        <Screen>
          <EmptyState title={t('project.notFound')} />
        </Screen>
      </>
    );
  }

  const list = tasks ?? [];
  const prog = projectProgress(list, id);
  const sorted = sortTasks(list);

  function openTask(t: Task) {
    setEditingTask(t);
    setTaskForm(true);
  }

  return (
    <>
      <PageHeader
        title={project.name}
        back="/progetti"
        action={
          <IconButton label={t('projectForm.edit')} onClick={() => setProjForm(true)}>
            <Pencil size={18} />
          </IconButton>
        }
      />
      <Screen>
        <Card className="flex items-center gap-4 mb-4">
          <ProgressRing progress={prog} size={56} stroke={7} color={project.color}>
            <span className="text-[12px] font-semibold tnum text-ink">{Math.round(prog * 100)}%</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            {project.description ? (
              <p className="text-[14px] text-ink-2 leading-snug">{project.description}</p>
            ) : (
              <p className="text-[14px] text-ink-3">{t('project.tasksTotal', { n: list.length })}</p>
            )}
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-[13px] font-semibold text-project"
              >
                <LinkIcon size={13} /> {t('project.openLink')}
              </a>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-between mb-3 gap-2">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'list', label: t('project.mode.list') },
              { value: 'kanban', label: t('project.mode.kanban') },
            ]}
          />
          <Button size="sm" icon={<Plus size={16} />} onClick={() => { setEditingTask(null); setTaskForm(true); }}>
            {t('projects.taskBtn')}
          </Button>
        </div>

        {list.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Plus size={22} />}
              title={t('project.tasks.empty.title')}
              description={t('project.tasks.empty.desc')}
              action={<Button onClick={() => setTaskForm(true)}>{t('project.tasks.empty.cta')}</Button>}
            />
          </Card>
        ) : mode === 'list' ? (
          <Card inset={false} className="px-4 divide-y divide-divider">
            {sorted.map((t) => (
              <TaskRow key={t.id} task={t} project={project} onOpen={openTask} />
            ))}
          </Card>
        ) : (
          <KanbanBoard tasks={list} project={project} onOpen={openTask} />
        )}
      </Screen>

      <TaskForm open={taskForm} onClose={() => setTaskForm(false)} task={editingTask} defaultProjectId={id} />
      <ProjectForm open={projForm} onClose={() => setProjForm(false)} project={project} onDeleted={() => navigate('/progetti')} />
    </>
  );
}
