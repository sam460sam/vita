// Shared PDF sections: branded header, party blocks, signature/audit block.
import { rgb } from 'pdf-lib';
import { COLORS, MARGIN, type PdfBuilder } from './PdfBuilder';
import { BRAND } from '@/config/brand';
import { usDate, usDateTime } from '@/lib/format';
import type { Client, CompanyInfo, Geo } from '@/data/types';

export function brandHeader(b: PdfBuilder, company: CompanyInfo, docTitle: string, ref: { number: string; dateMs: number }) {
  const name = company.name?.trim() || BRAND;
  const pageH = b.page.getHeight();
  const bandH = 66;

  // Full-width deep-green brand band with white company name + doc title.
  b.page.drawRectangle({ x: 0, y: pageH - bandH, width: b.page.getWidth(), height: bandH, color: COLORS.brand });
  b.page.drawText(name, { x: MARGIN, y: pageH - 32, size: 18, font: b.bold, color: COLORS.white });
  if (company.licenseNumber) {
    b.page.drawText(`License ${company.licenseNumber}`, { x: MARGIN, y: pageH - 48, size: 9, font: b.font, color: rgbWhite(0.82) });
  }
  const title = docTitle.toUpperCase();
  const titleW = b.bold.widthOfTextAtSize(title, 15);
  b.page.drawText(title, { x: b.right - titleW, y: pageH - 30, size: 15, font: b.bold, color: COLORS.white });
  const meta = `${ref.number}   ${usDate(new Date(ref.dateMs))}`;
  const metaW = b.font.widthOfTextAtSize(meta, 9);
  b.page.drawText(meta, { x: b.right - metaW, y: pageH - 46, size: 9, font: b.font, color: rgbWhite(0.82) });

  // Body resumes below the band; company contact details in muted ink.
  b.y = pageH - bandH - 16;
  const contact = [company.address, company.phone, company.email].filter(Boolean) as string[];
  if (contact.length) b.text(contact.join('  ·  '), { size: 9, color: COLORS.dust });
  b.space(8);
}

function rgbWhite(v: number) {
  return rgb(v, v, v);
}

export function partyBlock(b: PdfBuilder, label: string, client: Client, siteAddress?: string) {
  b.text(label, { size: 8, bold: true, color: COLORS.dust });
  b.text(client.name, { size: 11, bold: true });
  const lines = [client.company, client.phone, client.email, siteAddress ? `Site: ${siteAddress}` : ''].filter(Boolean) as string[];
  for (const l of lines) b.text(l, { size: 9, color: COLORS.dust });
  b.space(6);
}

export interface SignatureInfo {
  pngBytes?: Uint8Array;
  signerName: string;
  signerRole?: string;
  signedAt: number;
  geo?: Geo;
  deviceModel?: string;
  sha256: string;
}

export const SIGN_BANNER =
  'Electronic signature executed in accordance with the U.S. ESIGN Act and UETA. ' +
  'Document includes timestamp, SHA-256 fingerprint and, where permitted, geolocation.';

export async function signatureBlock(b: PdfBuilder, sig: SignatureInfo) {
  b.space(6);
  b.divider();
  b.text('SIGNATURE', { size: 8, bold: true, color: COLORS.dust });
  if (sig.pngBytes) {
    try {
      const png = await b.doc.embedPng(sig.pngBytes);
      const w = 180;
      const h = (png.height / png.width) * w;
      b.ensure(h + 6);
      b.page.drawImage(png, { x: b.left, y: b.y - h, width: w, height: h });
      b.y -= h + 6;
    } catch {
      /* skip image */
    }
  }
  b.text(`${sig.signerName}${sig.signerRole ? ` · ${sig.signerRole}` : ''}`, { size: 11, bold: true });
  b.text(`Signed ${usDateTime(sig.signedAt)}`, { size: 9, color: COLORS.dust });
  if (sig.geo) b.text(`Location ${sig.geo.lat.toFixed(5)}, ${sig.geo.lng.toFixed(5)}`, { size: 9, color: COLORS.dust });
  if (sig.deviceModel) b.text(`Device ${sig.deviceModel}`, { size: 9, color: COLORS.dust });
  b.text(`SHA-256 ${sig.sha256}`, { size: 7, color: COLORS.dust });
  b.space(4);
  b.paragraph(SIGN_BANNER, { size: 7, color: COLORS.dust });
}
