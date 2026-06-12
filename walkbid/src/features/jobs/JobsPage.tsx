import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Briefcase } from 'lucide-react';
import { useT } from '@/i18n';
import { Screen } from '@/app/Screen';
import { EmptyState, Button, IconButton, Pill, statusTone } from '@/ui';
import { listProjects } from '@/services/projects';
import { summarize } from '@/services/summary';
import { PROJECT_STATUSES } from '@/data/types';
import { ProjectForm } from '@/features/projects/ProjectForm';
import { JobCard } from './JobCard';

// Pipeline shown only for statuses with jobs; "done"/"disputed" still group.
export function JobsPage() {
  const t = useT();
  const projects = useLiveQuery(() => listProjects(), []);
  const summaries = useLiveQuery(async () => (projects ? summarize(projects) : []), [projects]);
  const [formOpen, setFormOpen] = useState(false);

  const loading = projects === undefined || summaries === undefined;

  const all = summaries ?? [];
  const groups = PROJECT_STATUSES.map((status) => ({
    status,
    items: all.filter((s) => s.project.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <Screen
      title={t('jobs.title')}
      action={
        <IconButton label={t('jobs.newJob')} onClick={() => setFormOpen(true)}>
          <Plus size={26} />
        </IconButton>
      }
    >
      {loading ? null : (summaries ?? []).length === 0 ? (
        <EmptyState
          icon={<Briefcase size={40} />}
          title={t('jobs.empty.title')}
          body={t('jobs.empty.body')}
          action={<Button onClick={() => setFormOpen(true)}>{t('jobs.empty.cta')}</Button>}
        />
      ) : (
        <div className="flex flex-col gap-6 p-4">
          {groups.map((g) => (
            <section key={g.status}>
              <div className="mb-2 flex items-center gap-2">
                <Pill tone={statusTone(g.status)}>{t(`status.${g.status}`)}</Pill>
                <span className="tnum text-xs text-dust">{g.items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {g.items.map((s) => (
                  <JobCard key={s.project.id} summary={s} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {formOpen && <ProjectForm open={formOpen} onClose={() => setFormOpen(false)} />}
    </Screen>
  );
}
