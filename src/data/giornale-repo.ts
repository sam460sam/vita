import { db, uid, now } from './db';
import type { GiornaleEntry } from './types';

export async function getGiornaleEntries(cantiereId: string): Promise<GiornaleEntry[]> {
  return db.giornaleEntries.where('cantiereId').equals(cantiereId).sortBy('data');
}

export async function getGiornaleEntry(cantiereId: string, data: string): Promise<GiornaleEntry | undefined> {
  return db.giornaleEntries
    .where('cantiereId').equals(cantiereId)
    .and((e) => e.data === data)
    .first();
}

export async function saveGiornaleEntry(
  partial: Omit<GiornaleEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = await getGiornaleEntry(partial.cantiereId, partial.data);
  if (existing) {
    await db.giornaleEntries.put({ ...existing, ...partial, updatedAt: now() });
    return existing.id;
  }
  const entry: GiornaleEntry = {
    ...partial,
    id: uid('g'),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.giornaleEntries.put(entry);
  return entry.id;
}

export async function deleteGiornaleEntry(id: string): Promise<void> {
  await db.giornaleEntries.delete(id);
}
