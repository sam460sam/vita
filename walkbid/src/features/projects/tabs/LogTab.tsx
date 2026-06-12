import { NotebookPen } from 'lucide-react';
import { useT } from '@/i18n';
import { EmptyState } from '@/ui';
import type { Project } from '@/data/types';

// Filled in M6 (Daily log).
export function LogTab({ project: _project }: { project: Project }) {
  const t = useT();
  return <EmptyState icon={<NotebookPen size={36} />} title={t('empty.log')} />;
}
