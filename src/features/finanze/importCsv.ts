// ============================================================================
// Bank statement CSV import. Banks export different column layouts, so we
// auto-detect the date / amount / description columns by header keywords, parse
// EU/US number & date formats, and auto-guess a category from the description.
// Runs fully in the browser; no bank connection or server required.
// (Direct Open Banking/PSD2 links need a paid aggregator + server — out of
//  scope for an offline-first app. CSV import covers virtually every bank.)
// ============================================================================
import type { Transaction } from '@/data/types';

export interface ParsedTx {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string; // yyyy-MM-dd
}

const DATE_KEYS = ['data contabile', 'data valuta', 'data operazione', 'booking date', 'value date', 'transaction date', 'data', 'date', 'fecha', 'datum'];
const AMOUNT_KEYS = ['importo', 'amount', 'value', 'montant', 'betrag', 'importe', 'amount (eur)'];
const DEBIT_KEYS = ['addebiti', 'uscite', 'debit', 'dare', 'debito', 'withdrawal', 'paid out', 'spese'];
const CREDIT_KEYS = ['accrediti', 'entrate', 'credit', 'avere', 'credito', 'deposit', 'paid in'];
const DESC_KEYS = ['descrizione', 'description', 'causale', 'dettagli', 'memo', 'operazione', 'beneficiario', 'merchant', 'payee', 'reference', 'narrative', 'concepto'];
const SIGN_KEYS = ['segno', 'sign', 'tipo', 'type', 'd/c', 'dare/avere', 'debit/credit'];

// Description keyword → category. First match wins; checked lowercased.
const EXPENSE_RULES: [string, readonly string[]][] = [
  ['groceries', ['supermerc', 'aliment', 'esselunga', 'coop', 'conad', 'carrefour', 'lidl', 'aldi', 'eurospin', 'pam', 'despar', 'grocery', 'market', 'tigre', 'penny']],
  ['restaurants', ['ristor', 'pizz', 'trattoria', 'osteria', 'mcdonald', 'burger', 'sushi', 'kebab', 'deliveroo', 'glovo', 'justeat', 'just eat', 'uber eats', 'restaurant', 'cafe', 'caffè', 'caffe', ' bar ']],
  ['transport', ['benzina', 'carburant', 'eni', 'q8', 'esso', 'tamoil', 'ip ', 'autostrad', 'telepass', 'treno', 'trenitalia', 'italo', 'atm milano', ' bus', 'metro', 'uber', 'taxi', 'parchegg', 'fuel', 'shell', 'bp ', 'freenow', 'bolt']],
  ['bills', ['enel', 'luce', 'bolletta', 'tim ', 'vodafone', 'windtre', 'iliad', 'fastweb', 'utility', 'electric', 'gas ', 'acqua', 'internet', 'pec ', 'canone']],
  ['health', ['farmac', 'pharmacy', 'medic', 'dottore', 'dentist', 'ospedal', 'clinic', 'health', 'parafarm', 'laborator']],
  ['subscriptions', ['netflix', 'spotify', 'disney', 'prime', 'youtube', 'icloud', 'google one', 'apple.com/bill', 'abbonamento', 'subscription', 'dazn', 'now tv', 'audible', 'patreon', 'chatgpt', 'openai']],
  ['shopping', ['amazon', 'zalando', 'zara', 'h&m', 'shop', 'store', 'ikea', 'mediaworld', 'unieuro', 'decathlon', 'aliexpress', 'temu', 'shein', 'leroy']],
  ['travel', ['booking', 'airbnb', 'ryanair', 'easyjet', 'trainline', 'hotel', 'volotea', 'wizz', 'flight', 'trip', 'expedia', 'lufthansa', 'ita airways']],
  ['leisure', ['cinema', 'teatro', 'steam', 'playstation', 'xbox', 'nintendo', 'palestra', 'gym', 'concert', 'event', 'museo', 'twitch']],
  ['home', ['affitto', 'rent', 'mutuo', 'mortgage', 'condominio', 'arredam', 'furniture']],
  ['investments', ['invest', 'etf', 'trading', 'crypto', 'binance', 'degiro', 'trade republic', 'directa', 'fineco invest']],
  ['gifts', ['regalo', 'gift']],
];
const INCOME_RULES: [string, readonly string[]][] = [
  ['salary', ['stipendio', 'salary', 'payroll', 'retribuz', 'accredito stipendio', 'busta paga']],
  ['refunds', ['rimborso', 'refund', 'reso', 'storno']],
  ['bonus', ['bonus', 'premio', 'tredicesima']],
  ['investments', ['dividend', 'interess', 'interest', 'cedola', 'capital gain']],
  ['gifts', ['regalo', 'gift', 'bonifico da']],
];

function guessCategory(note: string, type: 'income' | 'expense'): string {
  const n = ` ${note.toLowerCase()} `;
  const rules = type === 'income' ? INCOME_RULES : EXPENSE_RULES;
  for (const [cat, keys] of rules) if (keys.some((k) => n.includes(k))) return cat;
  return type === 'income' ? 'extra' : 'other';
}

function splitLine(line: string, sep: string): string[] {
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
  const counts = [';', ',', '\t', '|'].map((s) => [s, headerLine.split(s).length] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 1 ? counts[0][0] : ',';
}

function findIdx(headers: string[], keys: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  // Prefer exact match, then "contains".
  for (const k of keys) {
    const i = lower.findIndex((h) => h === k);
    if (i >= 0) return i;
  }
  for (const k of keys) {
    const i = lower.findIndex((h) => h.includes(k));
    if (i >= 0) return i;
  }
  return -1;
}

/** Parse an amount: EU (1.234,56) or US (1,234.56), parentheses/sign negatives. */
function parseAmount(raw: string): number {
  if (!raw) return NaN;
  const negative = /^\(.*\)$/.test(raw.trim()) || /-\s*$/.test(raw.trim()) || raw.trim().startsWith('-');
  let s = raw.replace(/[^\d.,]/g, '').trim();
  if (!s) return NaN;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.'); // EU: comma decimal
  else s = s.replace(/,/g, ''); // US/ISO: dot decimal
  const v = parseFloat(s);
  return Number.isFinite(v) ? (negative ? -Math.abs(v) : v) : NaN;
}

const MONTHS: Record<string, string> = {
  gen: '01', ene: '01', jan: '01', feb: '02', mar: '03', apr: '04', abr: '04', mag: '05', may: '05', mai: '05',
  giu: '06', jun: '06', lug: '07', jul: '07', ago: '08', aug: '08', set: '09', sep: '09', ott: '10', oct: '10',
  nov: '11', dic: '12', dec: '12',
};

function parseDate(raw: string): string | null {
  const s = raw.trim();
  // ISO yyyy-mm-dd or yyyy/mm/dd
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  // dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy (EU)
  m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
  if (m) {
    const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${yyyy}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  // dd mmm yyyy / dd-mmm-yy (e.g. "12 gen 2026", "5-Jan-26")
  m = s.match(/^(\d{1,2})[\s\-/]([A-Za-zàèé]{3})[A-Za-z]*[\s\-/](\d{2,4})/);
  if (m) {
    const mm = MONTHS[m[2].toLowerCase().slice(0, 3)];
    if (mm) {
      const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${yyyy}-${mm}-${m[1].padStart(2, '0')}`;
    }
  }
  return null;
}

export function parseBankCsv(text: string): ParsedTx[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Find the header row (first row containing a date-like keyword).
  let headerRow = 0;
  for (let i = 0; i < Math.min(lines.length, 25); i++) {
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
  const signIdx = findIdx(headers, SIGN_KEYS);
  if (dateIdx < 0 || (amountIdx < 0 && debitIdx < 0 && creditIdx < 0)) return [];

  const out: ParsedTx[] = [];
  for (let i = headerRow + 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], sep);
    const date = parseDate(cols[dateIdx] ?? '');
    if (!date) continue;

    let amount = NaN;
    let type: 'income' | 'expense' = 'expense';

    if ((debitIdx >= 0 || creditIdx >= 0) && amountIdx < 0) {
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
        // Sign comes from the value, or from a dedicated sign/type column.
        let positive = v >= 0;
        if (signIdx >= 0) {
          const sg = (cols[signIdx] ?? '').toLowerCase();
          if (/(^c$|credit|avere|accred|entrat|\+)/.test(sg)) positive = true;
          else if (/(^d$|debit|dare|addeb|uscit|-)/.test(sg)) positive = false;
        }
        type = positive ? 'income' : 'expense';
      }
    }

    if (!Number.isFinite(amount) || amount === 0) continue;
    const note = descIdx >= 0 ? (cols[descIdx] ?? '').replace(/\s+/g, ' ').slice(0, 80) : '';
    out.push({ type, amount, category: guessCategory(note, type), note: note || undefined, date });
  }
  return out;
}

export type { Transaction };
