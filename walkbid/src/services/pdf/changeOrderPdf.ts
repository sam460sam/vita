import { PdfBuilder, COLORS } from './PdfBuilder';
import { brandHeader, partyBlock, signatureBlock, type SignatureInfo } from './sections';
import { money, qty as fmtQty, unitLabel } from '@/lib/format';
import type { ChangeOrder, Client, CoItem, CompanyInfo, Project } from '@/data/types';

interface Args {
  company: CompanyInfo;
  project: Project;
  client: Client;
  changeOrder: ChangeOrder;
  items: CoItem[];
  signature?: SignatureInfo;
}

export async function buildChangeOrderPdf({ company, project, client, changeOrder, items, signature }: Args): Promise<Blob> {
  const b = await PdfBuilder.create();
  brandHeader(b, company, 'Change Order', { number: changeOrder.number, dateMs: changeOrder.createdAt });
  b.text(`${project.title} — ${changeOrder.title}`, { size: 13, bold: true });
  b.space(6);
  partyBlock(b, 'CLIENT', client, project.siteAddress);

  if (changeOrder.description) {
    b.paragraph(changeOrder.description, { size: 10 });
    b.space(6);
  }

  b.divider();
  for (const it of items) {
    b.row(`${it.description}  (${fmtQty(it.qty)} ${unitLabel(it.unit)})`, money(it.total), {
      color: it.total < 0 ? COLORS.risk : COLORS.ink,
    });
  }
  b.divider();
  b.row('CHANGE IN CONTRACT PRICE', money(changeOrder.deltaTotal), {
    size: 12,
    bold: true,
    color: changeOrder.deltaTotal < 0 ? COLORS.risk : COLORS.safety,
  });

  b.space(8);
  b.paragraph('This change order modifies the original contract. The contractor is authorized to perform the work above for the stated change in price.', {
    size: 8,
    color: COLORS.dust,
  });

  if (signature) await signatureBlock(b, signature);
  return b.toBlob();
}
