// Lightweight Letter-size PDF builder over pdf-lib. Client documents are
// printable white pages with black text and a safety-orange brand rule.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';

export const LETTER = { w: 612, h: 792 };
export const MARGIN = 54;

export const COLORS = {
  ink: rgb(0.08, 0.09, 0.1),
  dust: rgb(0.45, 0.48, 0.52),
  line: rgb(0.85, 0.86, 0.88),
  safety: rgb(1, 0.416, 0),
  go: rgb(0.13, 0.77, 0.37),
  risk: rgb(0.94, 0.27, 0.27),
};

export class PdfBuilder {
  doc!: PDFDocument;
  page!: PDFPage;
  font!: PDFFont;
  bold!: PDFFont;
  y = LETTER.h - MARGIN;

  static async create(): Promise<PdfBuilder> {
    const b = new PdfBuilder();
    b.doc = await PDFDocument.create();
    b.font = await b.doc.embedFont(StandardFonts.Helvetica);
    b.bold = await b.doc.embedFont(StandardFonts.HelveticaBold);
    b.addPage();
    return b;
  }

  addPage() {
    this.page = this.doc.addPage([LETTER.w, LETTER.h]);
    this.y = LETTER.h - MARGIN;
  }

  /** Ensure room for `needed` points; otherwise start a new page. */
  ensure(needed: number) {
    if (this.y - needed < MARGIN) this.addPage();
  }

  get left() {
    return MARGIN;
  }
  get right() {
    return LETTER.w - MARGIN;
  }

  text(s: string, opts: { size?: number; bold?: boolean; color?: RGB; x?: number } = {}) {
    const size = opts.size ?? 10;
    this.ensure(size + 4);
    this.page.drawText(s, {
      x: opts.x ?? this.left,
      y: this.y - size,
      size,
      font: opts.bold ? this.bold : this.font,
      color: opts.color ?? COLORS.ink,
    });
    this.y -= size + 5;
  }

  /** Left label + right value on one row (e.g. money). */
  row(label: string, value: string, opts: { size?: number; bold?: boolean; color?: RGB } = {}) {
    const size = opts.size ?? 10;
    this.ensure(size + 6);
    const font = opts.bold ? this.bold : this.font;
    this.page.drawText(label, { x: this.left, y: this.y - size, size, font, color: opts.color ?? COLORS.ink });
    const vw = font.widthOfTextAtSize(value, size);
    this.page.drawText(value, { x: this.right - vw, y: this.y - size, size, font, color: opts.color ?? COLORS.ink });
    this.y -= size + 6;
  }

  /** Word-wrapped paragraph. */
  paragraph(s: string, opts: { size?: number; color?: RGB; width?: number } = {}) {
    const size = opts.size ?? 10;
    const maxW = opts.width ?? this.right - this.left;
    const words = s.split(/\s+/);
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (this.font.widthOfTextAtSize(test, size) > maxW) {
        this.text(line, { size, color: opts.color });
        line = w;
      } else {
        line = test;
      }
    }
    if (line) this.text(line, { size, color: opts.color });
  }

  divider(color: RGB = COLORS.line) {
    this.ensure(10);
    this.page.drawLine({ start: { x: this.left, y: this.y }, end: { x: this.right, y: this.y }, thickness: 1, color });
    this.y -= 10;
  }

  space(pts = 8) {
    this.y -= pts;
  }

  async toBlob(): Promise<Blob> {
    const bytes = await this.doc.save();
    return new Blob([bytes as BlobPart], { type: 'application/pdf' });
  }

  async toBytes(): Promise<Uint8Array> {
    return this.doc.save();
  }
}
