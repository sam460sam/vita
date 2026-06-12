import { FilePlus2 } from 'lucide-react';
import { useT } from '@/i18n';
import { EmptyState } from '@/ui';
import type { Project } from '@/data/types';

// Filled in M3/M8 (Change orders).
export function ChangeOrdersTab({ project: _project }: { project: Project }) {
  const t = useT();
  return <EmptyState icon={<FilePlus2 size={36} />} title={t('empty.changeOrders')} />;
}
