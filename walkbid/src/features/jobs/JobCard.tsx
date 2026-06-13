import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useT } from '@/i18n';
import { Card, JobMoneyBar, MoneyText, Pill } from '@/ui';
import { money } from '@/lib/format';
import type { ProjectSummary } from '@/services/summary';

export function JobCard({ summary }: { summary: ProjectSummary }) {
  const nav = useNavigate();
  const t = useT();
  const { project, clientName, payments, contractTotal, atRisk } = summary;

  return (
    <Card className="active:bg-surface/70" onClick={() => nav(`/jobs/${project.id}`)}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-bold text-ink">{project.title}</div>
            <div className="truncate text-sm text-muted">{clientName}</div>
          </div>
          {contractTotal > 0 && <MoneyText amount={contractTotal} size="md" whole />}
        </div>

        {project.siteAddress && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} /> <span className="truncate">{project.siteAddress}</span>
          </div>
        )}

        {/* JobMoneyBar — first thing the eye lands on. */}
        <div className="mt-3">
          <JobMoneyBar payments={payments} />
        </div>

        {atRisk > 0 && (
          <div className="mt-3">
            <Pill tone="attention">
              <AlertTriangle size={12} className="mr-1" />
              {t('jobs.atRisk')} {money(atRisk)}
            </Pill>
          </div>
        )}
      </div>
    </Card>
  );
}
