import { PdfBuilder, COLORS } from './PdfBuilder';
import { brandHeader, partyBlock } from './sections';
import { money, usDate, usDateTime } from '@/lib/format';
import { paymentLabel, paymentStatusLabel } from '@/services/paymentsLabels';
import { geoLabel } from '@/platform/geo';
import type { ChangeOrder, Client, CompanyInfo, Contract, DiaryEntry, Payment, Photo, Project } from '@/data/types';

export interface ProofData {
  company: CompanyInfo;
  project: Project;
  client: Client;
  contract?: Contract;
  changeOrders: ChangeOrder[];
  payments: Payment[];
  diary: DiaryEntry[];
  photos: Array<{ photo: Photo; bytes: Uint8Array; mime: string }>;
}

// Single dossier for disputes / small-claims / lien support (informational).
export async function buildProofPdf(d: ProofData): Promise<Blob> {
  const b = await PdfBuilder.create();
  brandHeader(b, d.company, 'Proof Package', { number: d.project.id.slice(-6).toUpperCase(), dateMs: Date.now() });
  b.text(d.project.title, { size: 14, bold: true });
  b.space(4);
  partyBlock(b, 'CLIENT', d.client, d.project.siteAddress);
  b.text(`Generated ${usDateTime(Date.now())}`, { size: 8, color: COLORS.dust });
  b.space(6);

  // Contract
  section(b, 'Contract');
  if (d.contract?.status === 'signed') {
    b.row('Status', 'Signed', { bold: true, color: COLORS.go });
    b.text(`Signed by ${d.contract.signerName}${d.contract.signerRole ? ` (${d.contract.signerRole})` : ''}`, { size: 9 });
    if (d.contract.signedAt) b.text(`When ${usDateTime(d.contract.signedAt)}`, { size: 9, color: COLORS.dust });
    b.text(`Where ${geoLabel(d.contract.geo)}`, { size: 9, color: COLORS.dust });
    b.text(`SHA-256 ${d.contract.sha256}`, { size: 7, color: COLORS.dust });
  } else {
    b.text('No signed contract on file.', { size: 9, color: COLORS.dust });
  }
  b.space(8);

  // Change orders
  section(b, `Change orders (${d.changeOrders.length})`);
  if (d.changeOrders.length === 0) b.text('None.', { size: 9, color: COLORS.dust });
  for (const co of d.changeOrders) {
    b.row(`${co.number} — ${co.title}`, money(co.deltaTotal), { bold: true });
    b.text(`${co.status}${co.signedAt ? ` · signed by ${co.signerName} · ${usDateTime(co.signedAt)}` : ''}`, { size: 8, color: COLORS.dust });
    if (co.sha256) b.text(`SHA-256 ${co.sha256}`, { size: 7, color: COLORS.dust });
    b.space(2);
  }
  b.space(6);

  // Payments ledger
  section(b, 'Payments');
  if (d.payments.length === 0) b.text('No payment plan.', { size: 9, color: COLORS.dust });
  for (const p of d.payments) {
    b.row(`${paymentLabel(p.label)} — ${paymentStatusLabel(p.status)}`, money(p.amount), {
      color: p.status === 'paid' ? COLORS.go : p.status === 'late' ? COLORS.risk : COLORS.ink,
    });
  }
  b.space(6);

  // Daily logs
  section(b, `Daily log (${d.diary.length})`);
  for (const e of d.diary) {
    b.text(usDate(e.date), { size: 9, bold: true });
    if (e.text) b.paragraph(e.text, { size: 9, color: COLORS.dust });
    b.space(2);
  }
  b.space(6);

  // Photo timeline
  section(b, `Photos (${d.photos.length})`);
  for (const { photo, bytes, mime } of d.photos) {
    try {
      const img = mime.includes('png') ? await b.doc.embedPng(bytes) : await b.doc.embedJpg(bytes);
      let w = 220;
      let h = (img.height / img.width) * w;
      if (h > 180) {
        h = 180;
        w = (img.width / img.height) * h;
      }
      b.ensure(h + 22);
      b.page.drawImage(img, { x: b.left, y: b.y - h, width: w, height: h });
      b.y -= h + 4;
      const meta = `${usDateTime(photo.takenAt)}${photo.geo ? ` · ${geoLabel(photo.geo)}` : ''}`;
      b.text(meta, { size: 7, color: COLORS.dust });
      if (photo.caption) b.text(photo.caption, { size: 8 });
      b.space(6);
    } catch {
      /* skip unembeddable image */
    }
  }

  // Integrity page
  b.addPage();
  section(b, 'Integrity');
  b.paragraph('SHA-256 fingerprints of every signed document in this package. Recompute them from the source PDFs to confirm they are unaltered.', {
    size: 9,
    color: COLORS.dust,
  });
  b.space(4);
  if (d.contract?.sha256) {
    b.text('Contract', { size: 9, bold: true });
    b.text(d.contract.sha256, { size: 7, color: COLORS.dust });
    b.space(2);
  }
  for (const co of d.changeOrders.filter((c) => c.sha256)) {
    b.text(co.number, { size: 9, bold: true });
    b.text(co.sha256!, { size: 7, color: COLORS.dust });
    b.space(2);
  }

  return b.toBlob();
}

function section(b: PdfBuilder, title: string) {
  b.space(2);
  b.text(title.toUpperCase(), { size: 9, bold: true, color: COLORS.brand });
  b.divider(COLORS.line);
}
