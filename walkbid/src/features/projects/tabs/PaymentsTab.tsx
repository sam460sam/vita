import { Wallet } from 'lucide-react';
import { useT } from '@/i18n';
import { EmptyState } from '@/ui';
import type { Project } from '@/data/types';

// Filled in M4 (Payments / protection).
export function PaymentsTab({ project: _project }: { project: Project }) {
  const t = useT();
  return <EmptyState icon={<Wallet size={36} />} title={t('empty.payments')} />;
}
