// ============================================================================
// Bank statement CSV import. Banks export different column layouts, so we
// auto-detect the date / amount / description columns by header keywords.
// Runs fully in the browser; no bank connection or server required.
// (Direct Open Banking/PSD2 links need a paid aggregator + server — out of
//  scope for an offline app. CSV import covers virtually every bank.)
// ============================================================================
import type { Transaction } from '@/data/types';

export interface ParsedTx {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string; // yyyy-MM-dd
}

const DATE_KEYS = ['data', 'date', 'data contabile', 'data valuta', 'booking date', 'value date'];
const AMOUNT_KEYS = ['importo', 'amount', 'value', 'addebiti', 'accrediti'];
const DEBIT_KEYS = ['addebiti', 'uscite', 'debit', 'dare'];
const CREDIT_KEYS = ['accrediti', 'entrate', 'credit', 'avere'];
const DESC_KEYS = ['descrizione', 'description', 'causale', 'dettagli', 'memo', 'operazione'];

function splitLine(line: string, sep: string): string[] {
  // Minimal CSV field splitter with quote support.
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
    } else if (c === sep && !inQ) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function detectSep(headerLine: string): string {
  const counts = [';', ',', '\t'].map((s) => [s, headerLine.split(s).length] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 1 ? counts[0][0] : ',';
}

function findIdx(headers: string[], keys: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (const k of keys) {
    const i = lower.findIndex((h) => h.includes(k));
    if (i >= 0) return i;
  }
  return -1;
}

/** Parse an amount that may use European formatting (1.234,56) or US (1,234.56). */
function parseAmount(raw: string): number {
  let s = raw.replace(/[^\d.,\-]/g, '').trim();
  if (!s) return NaN;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > lastDot) {
    // European: comma is decimal
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    // US/ISO: dot is decimal
    s = s.replace(/,/g, '');
  }
  return parseFloat(s);
}

function parseDate(raw: string): string | null {
  const s = raw.trim();
  // ISO yyyy-mm-dd
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
  m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

export function parseBankCsv(text: string): ParsedTx[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Find the header row (first row containing a date-like keyword).
  let headerRow = 0;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const l = lines[i].toLowerCase();
    if (DATE_KEYS.some((k) => l.includes(k))) {
      headerRow = i;
      break;
    }
  }

  const sep = detectSep(lines[headerRow]);
  const headers = splitLine(lines[headerRow], sep);
  const dateIdx = findIdx(headers, DATE_KEYS);
  const descIdx = findIdx(headers, DESC_KEYS);
  const debitIdx = findIdx(headers, DEBIT_KEYS);
  const creditIdx = findIdx(headers, CREDIT_KEYS);
  const amountIdx = findIdx(headers, AMOUNT_KEYS);
  if (dateIdx < 0 || (amountIdx < 0 && debitIdx < 0 && creditIdx < 0)) return [];

  const out: ParsedTx[] = [];
  for (let i = headerRow + 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], sep);
    const date = parseDate(cols[dateIdx] ?? '');
    if (!date) continue;

    let amount = NaN;
    let type: 'income' | 'expense' = 'expense';

    if (debitIdx >= 0 || creditIdx >= 0) {
      const debit = debitIdx >= 0 ? parseAmount(cols[debitIdx] ?? '') : NaN;
      const credit = creditIdx >= 0 ? parseAmount(cols[creditIdx] ?? '') : NaN;
      if (Number.isFinite(credit) && credit !== 0) {
        amount = Math.abs(credit);
        type = 'income';
      } else if (Number.isFinite(debit) && debit !== 0) {
        amount = Math.abs(debit);
        type = 'expense';
      }
    } else {
      const v = parseAmount(cols[amountIdx] ?? '');
      if (Number.isFinite(v)) {
        amount = Math.abs(v);
        type = v >= 0 ? 'income' : 'expense';
      }
    }

    if (!Number.isFinite(amount) || amount === 0) continue;
    const note = descIdx >= 0 ? (cols[descIdx] ?? '').slice(0, 80) : undefined;
    out.push({ type, amount, category: 'other', note: note || undefined, date });
  }
  return out;
}

export type { Transaction };
