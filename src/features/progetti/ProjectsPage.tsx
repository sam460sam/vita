import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarClock, ChevronRight, Inbox, ListChecks, Plus, Sun } from 'lucide-react';
import { db } from '@/data/db';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, ProgressRing, EmptyState, Button, Divider, Sheet } from '@/ui';
import { TaskForm } from './TaskForm';
import { ProjectForm } from './ProjectForm';
import { TaskRow } from './TaskRow';
import { filterByView, projectCounts, projectProgress, sortTasks, type QuickView } from './logic';
import type { Task } from '@/data/types';
import { useT } from '@/i18n';

export function ProjectsPage() {
  const t = useT();
  const projects = useLiveQuery(() => db.projects.filter((p) => !p.archived).toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const [taskForm, setTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projForm, setProjForm] = useState(false);
  const [view, setView] = useState<QuickView | null>(null);

  const allTasks = tasks ?? [];
  const projMap = new Map((projects ?? []).map((p) => [p.id, p]));

  const quickViews: { id: QuickView; label: string; icon: typeof Sun }[] = [
    { id: 'today', label: t('projects.view.today'), icon: Sun },
    { id: 'week', label: t('projects.view.week'), icon: CalendarClock },
    { id: 'inbox', label: t('projects.view.inbox'), icon: Inbox },
    { id: 'completed', label: t('projects.view.completed'), icon: ListChecks },
  ];

  function openTask(t: Task) {
    setEditingTask(t);
    setTaskForm(true);
  }

  const viewTasks = view ? sortTasks(filterByView(allTasks, view)) : [];

  return (
    <>
      <PageHeader
        title={t('projects.title')}
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => { setEditingTask(null); setTaskForm(true); }}>
            {t('projects.taskBtn')}
          </Button>
        }
      />
      <Screen>
        {/* Quick views */}
        <Card inset={false} className="mb-4 overflow-hidden">
          {quickViews.map((qv, i) => {
            const count = filterByView(allTasks, qv.id).length;
            const Icon = qv.icon;
            return (
              <div key={qv.id}>
                {i > 0 && <Divider />}
                <button onClick={() => setView(qv.id)} className="w-full flex items-center gap-3 px-4 py-3 active:bg-section transition-colors">
                  <span className="h-8 w-8 rounded-full bg-section flex items-center justify-center text-ink-2">
                    <Icon size={17} />
                  </span>
                  <span className="flex-1 text-left text-[15px] text-ink font-medium">{qv.label}</span>
                  <span className="text-[13px] tnum text-ink-3">{count}</span>
                  <ChevronRight size={18} className="text-ink-3" />
                </button>
              </div>
            );
          })}
        </Card>

        {/* Projects */}
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="metric-label">{t('projects.label')}</h2>
          <button onClick={() => setProjForm(true)} className="text-[13px] font-semibold text-project flex items-center gap-1">
            <Plus size={14} /> {t('projects.new')}
          </button>
        </div>

        {projects && projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((p) => {
              const prog = projectProgress(allTasks, p.id);
              const counts = projectCounts(allTasks, p.id);
              return (
                <Link key={p.id} to={`/progetti/${p.id}`}>
                  <Card className="flex items-center gap-3 active:bg-section transition-colors">
                    <ProgressRing progress={prog} size={48} stroke={6} color={p.color}>
                      <span className="text-[11px] font-semibold tnum text-ink">{Math.round(prog * 100)}</span>
                    </ProgressRing>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-ink truncate">{p.name}</div>
                      <div className="text-[13px] text-ink-2 truncate">
                        {counts.open} {t('projects.open')} · {counts.total} {t('projects.total')}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-ink-3" />
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Plus size={22} />}
              title={t('projects.empty.title')}
              description={t('projects.empty.desc')}
              action={<Button onClick={() => setProjForm(true)}>{t('projects.empty.cta')}</Button>}
            />
          </Card>
        )}
      </Screen>

      {/* Quick-view sheet */}
      {view && (
        <QuickViewSheet
          view={view}
          tasks={viewTasks}
          projMap={projMap}
          onClose={() => setView(null)}
          onOpenTask={openTask}
        />
      )}

      <TaskForm open={taskForm} onClose={() => setTaskForm(false)} task={editingTask} />
      <ProjectForm open={projForm} onClose={() => setProjForm(false)} />
    </>
  );
}

function QuickViewSheet({
  view,
  tasks,
  projMap,
  onClose,
  onOpenTask,
}: {
  view: QuickView;
  tasks: Task[];
  projMap: Map<string, import('@/data/types').Project>;
  onClose: () => void;
  onOpenTask: (t: Task) => void;
}) {
  const t = useT();
  const viewLabels: Record<QuickView, string> = {
    today: t('projects.view.today'),
    week: t('projects.view.week'),
    inbox: t('projects.view.inbox'),
    completed: t('projects.view.completed'),
    all: t('projects.view.all'),
  };
  return (
    <Sheet open onClose={onClose} title={viewLabels[view]} size="full">
      {tasks.length === 0 ? (
        <EmptyState title={t('projects.view.empty.title')} description={t('projects.view.empty.desc')} />
      ) : (
        <div className="divide-y divide-divider">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} project={t.projectId ? projMap.get(t.projectId) : undefined} onOpen={(tk) => { onClose(); onOpenTask(tk); }} />
          ))}
        </div>
      )}
    </Sheet>
  );
}
