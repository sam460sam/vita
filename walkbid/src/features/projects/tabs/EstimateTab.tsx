import { FileText } from 'lucide-react';
import { useT } from '@/i18n';
import { EmptyState } from '@/ui';
import type { Project } from '@/data/types';

// Filled in M2 (Price book & Estimate).
export function EstimateTab({ project: _project }: { project: Project }) {
  const t = useT();
  return <EmptyState icon={<FileText size={36} />} title={t('empty.estimate')} />;
}
