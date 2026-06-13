import { PdfBuilder, COLORS } from './PdfBuilder';
import { brandHeader, partyBlock } from './sections';
import { computeTotals, round2 } from '@/services/estimates';
import { money, qty as fmtQty, unitLabel, usDate } from '@/lib/format';
import type { Client, CompanyInfo, Estimate, EstimateItem, Project } from '@/data/types';

interface Args {
  company: CompanyInfo;
  project: Project;
  client: Client;
  estimate: Estimate;
  items: EstimateItem[];
}

// Branded client-facing estimate. Markup is folded into each line price (never
// itemized to the client); document title is "Proposal".
export async function buildEstimatePdf({ company, project, client, estimate, items }: Args): Promise<Blob> {
  const b = await PdfBuilder.create();
  const m = estimate.markupRate;
  const totals = computeTotals(items, estimate.taxRate, estimate.markupRate);

  brandHeader(b, company, 'Proposal', { number: estimate.number, dateMs: estimate.createdAt });
  b.text(project.title, { size: 13, bold: true });
  b.space(6);
  partyBlock(b, 'PREPARED FOR', client, project.siteAddress);

  // Line item table header
  b.divider();
  drawCols(b, 'DESCRIPTION', 'QTY', 'RATE', 'AMOUNT', true);
  b.divider();
  for (const it of items) {
    const cUnit = round2(it.unitPrice * (1 + m));
    const cTotal = round2(it.total * (1 + m));
    drawCols(b, it.description, `${fmtQty(it.qty)} ${unitLabel(it.unit)}`, money(cUnit), money(cTotal));
  }
  b.divider();

  // Totals (client view: subtotal already includes markup; no markup line)
  b.row('Subtotal', money(totals.taxableBase), { bold: true });
  if (estimate.taxRate > 0) b.row(`Sales tax (${round2(estimate.taxRate * 100)}%)`, money(totals.taxAmount), { color: COLORS.dust });
  b.space(2);
  b.row('TOTAL', money(totals.total), { size: 13, bold: true, color: COLORS.brand });

  b.space(12);
  if (estimate.validUntil) b.text(`Valid until ${usDate(estimate.validUntil)}`, { size: 9, color: COLORS.dust });
  if (estimate.notes) {
    b.space(4);
    b.paragraph(estimate.notes, { size: 9, color: COLORS.dust });
  }

  b.space(10);
  b.paragraph(
    'Additional work performed only upon a signed change order. This proposal does not include permits or unforeseen site conditions unless stated above.',
    { size: 8, color: COLORS.dust },
  );

  return b.toBlob();
}

// Simple 4-column row: description (flex), qty, rate, amount (right-aligned).
function drawCols(b: PdfBuilder, desc: string, q: string, rate: string, amt: string, header = false) {
  const size = header ? 8 : 10;
  b.ensure(size + 6);
  const font = header ? b.bold : b.font;
  const color = header ? COLORS.dust : COLORS.ink;
  const xQty = b.right - 230;
  const xRate = b.right - 140;
  // Description (truncate to fit)
  let d = desc;
  while (font.widthOfTextAtSize(d, size) > xQty - b.left - 8 && d.length > 4) d = d.slice(0, -2);
  if (d !== desc) d = d.slice(0, -1) + '…';
  const yy = b.y - size;
  b.page.drawText(d, { x: b.left, y: yy, size, font, color });
  b.page.drawText(q, { x: xQty, y: yy, size, font, color });
  const rateW = font.widthOfTextAtSize(rate, size);
  b.page.drawText(rate, { x: xRate - rateW + 60, y: yy, size, font, color });
  const amtW = font.widthOfTextAtSize(amt, size);
  b.page.drawText(amt, { x: b.right - amtW, y: yy, size, font, color });
  b.y -= size + 6;
}
