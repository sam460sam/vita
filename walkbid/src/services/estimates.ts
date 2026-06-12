import { db, now, uid } from '@/data/db';
import { getSettings } from './settings';
import type { Estimate, EstimateItem, ID, PriceBookItem, Unit } from '@/data/types';

// ---------------------------------------------------------------------------
// Totals. Markup is shown to the contractor and folded into client-facing line
// prices on the PDF (never itemized to the client). Tax applies after markup.
// ---------------------------------------------------------------------------
export interface Totals {
  base: number; // sum of line totals at entered prices
  markupAmount: number;
  taxableBase: number; // base + markup
  taxAmount: number;
  total: number;
}

export function computeTotals(items: { total: number }[], taxRate: number, markupRate: number): Totals {
  const base = round2(items.reduce((s, i) => s + (i.total || 0), 0));
  const markupAmount = round2(base * markupRate);
  const taxableBase = round2(base + markupAmount);
  const taxAmount = round2(taxableBase * taxRate);
  const total = round2(taxableBase + taxAmount);
  return { base, markupAmount, taxableBase, taxAmount, total };
}

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
export const lineTotal = (qty: number, unitPrice: number): number => round2((qty || 0) * (unitPrice || 0));

// ---------------------------------------------------------------------------
// Estimate CRUD
// ---------------------------------------------------------------------------
export async function estimateForProject(projectId: ID): Promise<Estimate | undefined> {
  return db.estimates.where('projectId').equals(projectId).first();
}

export async function itemsForEstimate(estimateId: ID): Promise<EstimateItem[]> {
  const rows = await db.estimateItems.where('estimateId').equals(estimateId).toArray();
  return rows.sort((a, b) => a.sort - b.sort);
}

async function nextEstimateNumber(): Promise<string> {
  const count = await db.estimates.count();
  return `EST-${1001 + count}`;
}

export async function getOrCreateEstimate(projectId: ID): Promise<Estimate> {
  const existing = await estimateForProject(projectId);
  if (existing) return existing;
  const s = await getSettings();
  const est: Estimate = {
    id: uid('est_'),
    projectId,
    number: await nextEstimateNumber(),
    status: 'draft',
    taxRate: s.defaultTaxRate,
    markupRate: s.defaultMarkupRate,
    subtotal: 0,
    total: 0,
    createdAt: now(),
  };
  await db.estimates.put(est);
  return est;
}

export async function updateEstimate(id: ID, patch: Partial<Estimate>): Promise<void> {
  const e = await db.estimates.get(id);
  if (!e) return;
  await db.estimates.put({ ...e, ...patch });
}

/** Recompute and persist subtotal/total from current line items + rates. */
export async function recalcEstimate(estimateId: ID): Promise<Totals> {
  const e = await db.estimates.get(estimateId);
  if (!e) return { base: 0, markupAmount: 0, taxableBase: 0, taxAmount: 0, total: 0 };
  const items = await itemsForEstimate(estimateId);
  const totals = computeTotals(items, e.taxRate, e.markupRate);
  await db.estimates.put({ ...e, subtotal: totals.base, total: totals.total });
  return totals;
}

// ---------------------------------------------------------------------------
// Line items
// ---------------------------------------------------------------------------
export async function addItem(
  estimateId: ID,
  data: { description: string; qty: number; unit: Unit; unitPrice: number; priceBookId?: ID },
): Promise<void> {
  const count = await db.estimateItems.where('estimateId').equals(estimateId).count();
  const item: EstimateItem = {
    id: uid('eit_'),
    estimateId,
    priceBookId: data.priceBookId,
    description: data.description,
    qty: data.qty,
    unit: data.unit,
    unitPrice: data.unitPrice,
    total: lineTotal(data.qty, data.unitPrice),
    sort: count,
  };
  await db.estimateItems.put(item);
  await recalcEstimate(estimateId);
}

export async function addItemFromPriceBook(estimateId: ID, pb: PriceBookItem, qty: number, locale: 'en' | 'es' = 'en'): Promise<void> {
  await addItem(estimateId, {
    description: pb.description[locale] || pb.description.en,
    qty,
    unit: pb.unit,
    unitPrice: pb.unitPrice,
    priceBookId: pb.id,
  });
}

export async function updateItem(id: ID, patch: Partial<EstimateItem>): Promise<void> {
  const i = await db.estimateItems.get(id);
  if (!i) return;
  const next = { ...i, ...patch };
  next.total = lineTotal(next.qty, next.unitPrice);
  await db.estimateItems.put(next);
  await recalcEstimate(i.estimateId);
}

export async function deleteItem(id: ID): Promise<void> {
  const i = await db.estimateItems.get(id);
  if (!i) return;
  await db.estimateItems.delete(id);
  await recalcEstimate(i.estimateId);
}
