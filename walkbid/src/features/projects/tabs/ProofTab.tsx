import { ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/ui';
import type { Project } from '@/data/types';

// Filled in M5 (Proof package).
export function ProofTab({ project: _project }: { project: Project }) {
  return (
    <EmptyState icon={<ShieldCheck size={36} />} title="Proof package" body="Build the dossier once the job has signed documents." />
  );
}
