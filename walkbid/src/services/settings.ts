import { db, now } from '@/data/db';
import { defaultSettings } from '@/data/defaults';
import type { Settings } from '@/data/types';

export async function getSettings(): Promise<Settings> {
  let s = await db.settings.get('app');
  if (!s) {
    s = defaultSettings();
    await db.settings.put(s);
  }
  return s;
}

/** Read-only accessor safe inside Dexie liveQuery. */
export async function readSettings(): Promise<Settings> {
  return (await db.settings.get('app')) ?? defaultSettings();
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const s = await getSettings();
  await db.settings.put({ ...s, ...patch, updatedAt: now() });
}

export async function updateCompany(patch: Partial<Settings['company']>): Promise<void> {
  const s = await getSettings();
  await db.settings.put({ ...s, company: { ...s.company, ...patch }, updatedAt: now() });
}
