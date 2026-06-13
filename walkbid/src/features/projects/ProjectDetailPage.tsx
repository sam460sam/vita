import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { MoreVertical, AlertTriangle, MapPin } from 'lucide-react';
import { useT, type TKey } from '@/i18n';
import { Screen } from '@/app/Screen';
import { JobMoneyBar, IconButton, Sheet, Pill, statusTone } from '@/ui';
import { getProject, setProjectStatus, deleteProject } from '@/services/projects';
import { projectSummary, depositUncollected } from '@/services/summary';
import { db } from '@/data/db';
import { PROJECT_STATUSES } from '@/data/types';
import { ProjectForm } from './ProjectForm';
import { EstimateTab } from './tabs/EstimateTab';
import { ContractTab } from './tabs/ContractTab';
import { ChangeOrdersTab } from './tabs/ChangeOrdersTab';
import { LogTab } from './tabs/LogTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { ProofTab } from './tabs/ProofTab';

type TabId = 'estimate' | 'contract' | 'changeOrders' | 'log' | 'payments' | 'proof';
const TABS: Array<{ id: TabId; key: TKey }> = [
  { id: 'estimate', key: 'tab.estimate' },
  { id: 'contract', key: 'tab.contract' },
  { id: 'changeOrders', key: 'tab.changeOrders' },
  { id: 'log', key: 'tab.log' },
  { id: 'payments', key: 'tab.payments' },
  { id: 'proof', key: 'tab.proof' },
];

export function ProjectDetailPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const project = useLiveQuery(() => getProject(id), [id]);
  const summary = useLiveQuery(async () => (project ? projectSummary(project) : null), [project]);
  const depositWarn = useLiveQuery(() => depositUncollected(id), [id]) ?? false;

  const tab = (params.get('tab') as TabId) || 'estimate';
  const setTab = (next: TabId) => setParams({ tab: next }, { replace: true });

  if (project === undefined) return <Screen title="" back flush><div /></Screen>;
  if (project === null) {
    nav('/jobs', { replace: true });
    return null;
  }

  return (
    <Screen
      title={project.title}
      subtitle={summary?.clientName}
      back
      flush
      action={
        <IconButton label={t('common.edit')} onClick={() => setMenuOpen(true)}>
          <MoreVertical size={22} />
        </IconButton>
      }
    >
      {/* Status + JobMoneyBar */}
      <div className="border-b border-hairline px-4 pb-4">
        {project.siteAddress && (
          <div className="mb-3 flex items-center gap-1 text-sm text-muted">
            <MapPin size={13} /> {project.siteAddress}
          </div>
        )}
        <JobMoneyBar payments={summary?.payments ?? []} />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {PROJECT_STATUSES.map((s) => (
            <button key={s} onClick={() => setProjectStatus(id, s)} className="shrink-0">
              <Pill tone={project.status === s ? statusTone(s) : 'neutral'} className={project.status === s ? '' : 'opacity-50'}>
                {t(`status.${s}` as TKey)}
              </Pill>
            </button>
          ))}
        </div>
      </div>

      {/* Deposit protection banner */}
      {depositWarn && (
        <div className="flex items-center gap-2 bg-attention/15 px-4 py-3 text-sm font-semibold text-attention">
          <AlertTriangle size={16} /> {t('project.depositWarning')}
        </div>
      )}

      {/* Tabs */}
      <div className="no-scrollbar sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-hairline bg-bg px-2">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={
              'shrink-0 whitespace-nowrap px-3 py-3 text-sm font-bold ' +
              (tab === tb.id ? 'border-b-2 border-accent text-ink' : 'text-muted')
            }
          >
            {t(tb.key)}
          </button>
        ))}
      </div>

      <div className="pb-28">
        {tab === 'estimate' && <EstimateTab project={project} />}
        {tab === 'contract' && <ContractTab project={project} />}
        {tab === 'changeOrders' && <ChangeOrdersTab project={project} />}
        {tab === 'log' && <LogTab project={project} />}
        {tab === 'payments' && <PaymentsTab project={project} />}
        {tab === 'proof' && <ProofTab project={project} />}
      </div>

      {/* Overflow menu */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title={project.title}>
        <div className="flex flex-col gap-2">
          <button
            className="min-h-touch rounded-btn border border-hairline px-4 text-left font-semibold text-ink active:bg-surface-2/60"
            onClick={() => {
              setMenuOpen(false);
              setEditOpen(true);
            }}
          >
            {t('project.edit')}
          </button>
          <button
            className="min-h-touch rounded-btn border border-danger/40 px-4 text-left font-semibold text-danger active:bg-danger/10"
            onClick={async () => {
              if (confirm(t('common.delete') + '?')) {
                await deleteProject(id);
                nav('/jobs', { replace: true });
              }
            }}
          >
            {t('common.delete')}
          </button>
          <DangerCount projectId={id} />
        </div>
      </Sheet>

      {editOpen && <ProjectForm open={editOpen} onClose={() => setEditOpen(false)} existing={project} />}
    </Screen>
  );
}

function DangerCount({ projectId }: { projectId: string }) {
  const counts = useLiveQuery(async () => {
    const [est, co, ph] = await Promise.all([
      db.estimates.where('projectId').equals(projectId).count(),
      db.changeOrders.where('projectId').equals(projectId).count(),
      db.photos.where('projectId').equals(projectId).count(),
    ]);
    return { est, co, ph };
  }, [projectId]);
  if (!counts) return null;
  return (
    <p className="px-1 pt-2 text-xs text-muted">
      {counts.est} estimates · {counts.co} change orders · {counts.ph} photos
    </p>
  );
}
