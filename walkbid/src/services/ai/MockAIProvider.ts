// Default provider: deterministic, fully offline. Matches dictated phrases to
// the contractor's own price book by keyword and pulls quantities from the
// text. Unmatched phrases become `needsPricing` lines for the editable draft.
import type { PriceBookItem } from '@/data/types';
import type { AIProvider, ChangeOrderDraft, DraftLine, EstimateDraft, LogDraft } from './types';
import { extractNumber, segments } from './nlp';

function keywords(item: PriceBookItem): string[] {
  return `${item.description.en} ${item.description.es}`
    .toLowerCase()
    .split(/[^a-zà-ÿ]+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}
const STOP = new Set(['with', 'supplied', 'installed', 'standard', 'existing', 'concrete', 'material', 'finishing', 'face', 'operator']);

function matchItem(segment: string, priceBook: PriceBookItem[]): PriceBookItem | null {
  const seg = segment.toLowerCase();
  let best: { item: PriceBookItem; score: number } | null = null;
  for (const item of priceBook) {
    let score = 0;
    for (const kw of keywords(item)) if (seg.includes(kw)) score += kw.length;
    if (score > 0 && (!best || score > best.score)) best = { item, score };
  }
  return best?.item ?? null;
}

function lineFromSegment(segment: string, priceBook: PriceBookItem[]): DraftLine | null {
  const item = matchItem(segment, priceBook);
  const qty = extractNumber(segment) ?? 0;
  if (item) {
    return { description: item.description.en, qty, unit: item.unit, unitPrice: item.unitPrice, priceBookId: item.id, needsPricing: false };
  }
  // No price-book match but the phrase mentions a number → unpriced draft line.
  if (qty > 0) {
    return { description: titleCase(segment), qty, unit: 'ls', unitPrice: null, priceBookId: null, needsPricing: true };
  }
  return null;
}

function titleCase(s: string): string {
  const t = s.trim().replace(/\s+/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export class MockAIProvider implements AIProvider {
  async draftEstimate({ transcript, priceBook }: { transcript: string; priceBook: PriceBookItem[] }): Promise<EstimateDraft> {
    const items = segments(transcript)
      .map((s) => lineFromSegment(s, priceBook))
      .filter((l): l is DraftLine => l !== null);
    return { items, notes: items.length === 0 ? 'No lines detected — add them manually.' : null };
  }

  async draftChangeOrder({ transcript, priceBook }: { transcript: string; priceBook: PriceBookItem[] }): Promise<ChangeOrderDraft> {
    const items = segments(transcript)
      .map((s) => lineFromSegment(s, priceBook))
      .filter((l): l is DraftLine => l !== null);
    const firstClause = segments(transcript)[0] ?? transcript;
    return {
      title: titleCase(firstClause).slice(0, 60),
      description: titleCase(transcript),
      items,
      notes: null,
    };
  }

  async summarizeLog({ transcript }: { transcript: string }): Promise<LogDraft> {
    const lower = transcript.toLowerCase();
    const weather = ['rain', 'sun', 'cloud', 'hot', 'cold', 'wind', 'snow', 'lluvia', 'sol', 'calor', 'frío'].find((w) => lower.includes(w)) ?? '';
    const issues = /issue|problem|delay|broke|short|missing|problema|retraso|falta/.test(lower) ? 'See notes' : '';
    const workDone = titleCase(transcript);
    return {
      workDone,
      crewPresent: '',
      weather: weather ? titleCase(weather) : '',
      issues,
      text: workDone,
    };
  }
}
