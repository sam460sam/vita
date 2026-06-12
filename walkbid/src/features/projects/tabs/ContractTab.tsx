import { FileSignature } from 'lucide-react';
import { useT } from '@/i18n';
import { EmptyState } from '@/ui';
import type { Project } from '@/data/types';

// Filled in M3 (Contract + Signature).
export function ContractTab({ project: _project }: { project: Project }) {
  const t = useT();
  return <EmptyState icon={<FileSignature size={36} />} title={t('empty.contract')} />;
}
