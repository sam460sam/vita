// Aggregations for list/pipeline views. Money-at-risk per project (spec §6 M1):
// sum of unsigned change orders + unpaid late payments.
import { db } from '@/data/db';
import type { ID, Payment, Project } from '@/data/types';

export interface ProjectSummary {
  project: Project;
  clientName: string;
  payments: Payment[];
  contractTotal: number; // signed contract total + signed CO deltas
  paidTotal: number;
  atRisk: number; // unsigned COs + late unpaid payments
}

export async function projectSummary(project: Project): Promise<ProjectSummary> {
  const [client, payments, changeOrders, contract, estimate] = await Promise.all([
    db.clients.get(project.clientId),
    db.payments.where('projectId').equals(project.id).toArray(),
    db.changeOrders.where('projectId').equals(project.id).toArray(),
    db.contracts.where('projectId').equals(project.id).first(),
    db.estimates.where('projectId').equals(project.id).first(),
  ]);

  const unsignedCO = changeOrders
    .filter((c) => c.status === 'draft' || c.status === 'pending_signature')
    .reduce((s, c) => s + c.deltaTotal, 0);
  const lateUnpaid = payments.filter((p) => p.status === 'late').reduce((s, p) => s + p.amount, 0);
  const signedCO = changeOrders.filter((c) => c.status === 'signed').reduce((s, c) => s + c.deltaTotal, 0);

  const baseTotal = contract?.status === 'signed' ? (estimate?.total ?? 0) : 0;
  const paidTotal = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return {
    project,
    clientName: client?.name ?? '—',
    payments: payments.sort((a, b) => a.sort - b.sort),
    contractTotal: baseTotal + signedCO,
    paidTotal,
    atRisk: unsignedCO + lateUnpaid,
  };
}

export async function summarize(projects: Project[]): Promise<ProjectSummary[]> {
  return Promise.all(projects.map(projectSummary));
}

/** Whether the deposit is still uncollected (drives the "don't break ground" banner). */
export async function depositUncollected(projectId: ID): Promise<boolean> {
  const deposit = (await db.payments.where('projectId').equals(projectId).toArray()).find((p) => p.label === 'deposit');
  return !!deposit && (deposit.status === 'pending' || deposit.status === 'late');
}
