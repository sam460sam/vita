// Orchestrates PDF generation + native sharing for client documents.
import { db } from '@/data/db';
import { getSettings } from './settings';
import { itemsForEstimate } from './estimates';
import { buildEstimatePdf } from './pdf/estimatePdf';
import { shareFile } from '@/platform/share';
import { paymentLabel } from './paymentsLabels';
import { BRAND } from '@/config/brand';
import { money, todayISO } from '@/lib/format';
import type { Estimate, ID, Payment } from '@/data/types';

function safeName(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'job';
}

export async function buildEstimateBlob(estimate: Estimate): Promise<Blob | null> {
  const [settings, project, items] = await Promise.all([
    getSettings(),
    db.projects.get(estimate.projectId),
    itemsForEstimate(estimate.id),
  ]);
  if (!project) return null;
  const client = await db.clients.get(project.clientId);
  if (!client) return null;
  return buildEstimatePdf({ company: settings.company, project, client, estimate, items });
}

export async function shareEstimate(estimate: Estimate): Promise<boolean> {
  const blob = await buildEstimateBlob(estimate);
  if (!blob) return false;
  const project = await db.projects.get(estimate.projectId);
  const filename = `${BRAND}_Proposal_${safeName(project?.title ?? '')}_${todayISO()}.pdf`;
  await shareFile(filename, blob, `Proposal — ${project?.title ?? BRAND}`);
  return true;
}

/** Ready-to-send payment request text (amount, project, instructions, link). */
export async function buildPaymentMessage(payment: Payment, link?: string): Promise<string> {
  const [settings, project] = await Promise.all([getSettings(), db.projects.get(payment.projectId)]);
  const company = settings.company.name || BRAND;
  const lines = [
    `Payment request — ${project?.title ?? company}`,
    `${paymentLabel(payment.label)}: ${money(payment.amount)}`,
  ];
  if (settings.company.paymentInstructions?.trim()) lines.push('', settings.company.paymentInstructions.trim());
  if (link?.trim()) lines.push('', `Pay online: ${link.trim()}`);
  lines.push('', `— ${company}`);
  return lines.join('\n');
}

export async function projectClientName(projectId: ID): Promise<string> {
  const p = await db.projects.get(projectId);
  if (!p) return '';
  const c = await db.clients.get(p.clientId);
  return c?.name ?? '';
}
