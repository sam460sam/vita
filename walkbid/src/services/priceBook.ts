import { db, now, uid } from '@/data/db';
import type { ID, PriceBookItem, Unit } from '@/data/types';

export async function listPriceBook(activeOnly = false): Promise<PriceBookItem[]> {
  const all = await db.priceBook.toArray();
  const rows = activeOnly ? all.filter((i) => i.active) : all;
  return rows.sort((a, b) => a.trade.localeCompare(b.trade) || a.code.localeCompare(b.code));
}

export async function getPriceItem(id: ID): Promise<PriceBookItem | undefined> {
  return db.priceBook.get(id);
}

export async function createPriceItem(
  data: Pick<PriceBookItem, 'trade' | 'code' | 'description' | 'unit' | 'unitPrice'> & Partial<PriceBookItem>,
): Promise<PriceBookItem> {
  const item: PriceBookItem = {
    id: uid('pb_'),
    trade: data.trade.trim() || 'Other',
    code: data.code.trim() || `C${now().toString(36).slice(-4).toUpperCase()}`,
    description: data.description,
    unit: data.unit,
    unitPrice: data.unitPrice,
    cost: data.cost,
    active: data.active ?? true,
    isDefault: false,
  };
  await db.priceBook.put(item);
  return item;
}

export async function updatePriceItem(id: ID, patch: Partial<PriceBookItem>): Promise<void> {
  const i = await db.priceBook.get(id);
  if (!i) return;
  // Editing a seeded default clears its "default" flag (it's now the user's price).
  await db.priceBook.put({ ...i, ...patch, isDefault: i.isDefault && patch.unitPrice === undefined ? i.isDefault : false });
}

export async function deletePriceItem(id: ID): Promise<void> {
  await db.priceBook.delete(id);
}

/** Distinct trade names for grouping/pickers. */
export async function trades(): Promise<string[]> {
  const all = await db.priceBook.toArray();
  return [...new Set(all.map((i) => i.trade))].sort();
}

export const ALL_UNITS: Unit[] = ['sf', 'sy', 'cy', 'lf', 'ea', 'hr', 'ton', 'ls'];
