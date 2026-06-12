import { PdfBuilder, COLORS } from './PdfBuilder';
import { brandHeader, partyBlock, signatureBlock, type SignatureInfo } from './sections';
import { contractTerms } from './terms';
import { computeTotals, round2 } from '@/services/estimates';
import { money, qty as fmtQty, unitLabel, dueLabel } from '@/lib/format';
import { paymentLabel } from '@/services/paymentsLabels';
import type { Client, CompanyInfo, Contract, Estimate, EstimateItem, Payment, Project } from '@/data/types';

interface Args {
  company: CompanyInfo;
  project: Project;
  client: Client;
  estimate: Estimate;
  items: EstimateItem[];
  payments: Payment[];
  contract: Contract;
  signature?: SignatureInfo; // present when finalizing a signed contract
}

export async function buildContractPdf({ company, project, client, estimate, items, payments, contract, signature }: Args): Promise<Blob> {
  const b = await PdfBuilder.create();
  const m = estimate.markupRate;
  const totals = computeTotals(items, estimate.taxRate, estimate.markupRate);

  brandHeader(b, company, 'Contract', { number: estimate.number.replace('EST', 'AGR'), dateMs: contract.createdAt });
  b.text(project.title, { size: 13, bold: true });
  b.space(6);
  partyBlock(b, 'CONTRACTOR', { ...client, name: company.name || client.name, company: undefined } as Client, undefined);
  partyBlock(b, 'CLIENT', client, project.siteAddress);

  // Scope = estimate lines (client-facing prices, markup folded in)
  b.divider();
  b.text('SCOPE OF WORK', { size: 8, bold: true, color: COLORS.dust });
  for (const it of items) {
    b.row(`${it.description}  (${fmtQty(it.qty)} ${unitLabel(it.unit)})`, money(round2(it.total * (1 + m))));
  }
  b.divider();
  b.row('Subtotal', money(totals.taxableBase), { bold: true });
  if (estimate.taxRate > 0) b.row(`Sales tax (${round2(estimate.taxRate * 100)}%)`, money(totals.taxAmount), { color: COLORS.dust });
  b.row('CONTRACT TOTAL', money(totals.total), { size: 12, bold: true, color: COLORS.safety });

  // Payment schedule (from M4)
  if (payments.length > 0) {
    b.space(8);
    b.text('PAYMENT SCHEDULE', { size: 8, bold: true, color: COLORS.dust });
    for (const p of payments) {
      const when = p.dueRule.type === 'date' ? dueLabel(p.dueRule.date) : p.dueRule.event === 'signature' ? 'On signing' : p.dueRule.event === 'co_signed' ? 'On change order' : 'On completion';
      b.row(`${paymentLabel(p.label)} — ${when}`, money(p.amount));
    }
  }

  // Terms
  b.space(10);
  for (const t of contractTerms({ companyName: company.name, clientName: client.name, siteAddress: project.siteAddress, totalText: money(totals.total) })) {
    b.text(t.heading, { size: 10, bold: true });
    b.paragraph(t.body, { size: 9, color: COLORS.dust });
    b.space(4);
  }

  if (signature) await signatureBlock(b, signature);

  return b.toBlob();
}
