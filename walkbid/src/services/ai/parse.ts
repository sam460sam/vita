// Defensive JSON parsing for AI responses. Strips code fences, finds the JSON
// body, and validates against lightweight shape checks. Never throws into the
// UI — callers get a typed result or a thrown Error they convert to a toast.
import { UNITS, type Unit } from '@/data/types';
import type { ChangeOrderDraft, DraftLine, EstimateDraft, LogDraft } from './types';

/** Remove ```json fences and isolate the first {...} object. */
export function extractJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  return s;
}

export function parseJson<T = unknown>(raw: string): T {
  return JSON.parse(extractJson(raw)) as T;
}

const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && isFinite(v) ? v : Number(v) || fallback);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const unit = (v: unknown): Unit => (UNITS.includes(v as Unit) ? (v as Unit) : 'ls');

function toLine(raw: unknown): DraftLine {
  const o = (raw ?? {}) as Record<string, unknown>;
  const priceBookId = typeof o.priceBookId === 'string' ? o.priceBookId : null;
  const unitPrice = o.unitPrice == null ? null : num(o.unitPrice);
  return {
    description: str(o.description, 'Item'),
    qty: num(o.qty, 0),
    unit: unit(o.unit),
    unitPrice,
    priceBookId,
    needsPricing: unitPrice == null,
  };
}

export function validateEstimateDraft(raw: unknown): EstimateDraft {
  const o = (raw ?? {}) as Record<string, unknown>;
  const items = Array.isArray(o.items) ? o.items.map(toLine) : [];
  return { items, notes: o.notes == null ? null : str(o.notes) };
}

export function validateChangeOrderDraft(raw: unknown): ChangeOrderDraft {
  const o = (raw ?? {}) as Record<string, unknown>;
  const items = Array.isArray(o.items) ? o.items.map(toLine) : [];
  return {
    title: str(o.title, 'Change order'),
    description: str(o.description),
    items,
    notes: o.notes == null ? null : str(o.notes),
  };
}

export function validateLogDraft(raw: unknown): LogDraft {
  const o = (raw ?? {}) as Record<string, unknown>;
  const workDone = str(o.workDone);
  const crewPresent = str(o.crewPresent);
  const weather = str(o.weather);
  const issues = str(o.issues);
  const text =
    str(o.text) ||
    [workDone && `Work done: ${workDone}`, crewPresent && `Crew: ${crewPresent}`, weather && `Weather: ${weather}`, issues && `Issues: ${issues}`]
      .filter(Boolean)
      .join('\n');
  return { workDone, crewPresent, weather, issues, text };
}
