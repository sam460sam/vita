import { db, now, uid } from './db';
import type { WorkDay, WorkProfile } from './types';

export const WORKER_ID = 'local';

// ---------- WorkDays ----------

export async function getWorkDaysMonth(anno: number, mese: number): Promise<WorkDay[]> {
  const prefix = `${anno}-${String(mese).padStart(2, '0')}`;
  return db.workDays
    .where('data')
    .startsWith(prefix)
    .filter((w) => w.workerId === WORKER_ID)
    .toArray();
}

export async function saveWorkDay(
  data: Omit<WorkDay, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = data.id ? await db.workDays.get(data.id) : undefined;
  const id = data.id ?? uid('wd_');
  await db.workDays.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  });
  return id;
}

export async function deleteWorkDay(id: string): Promise<void> {
  await db.workDays.delete(id);
}

/** All days for all workers — for the "Vista impresa" company summary. */
export async function getAllWorkDays(): Promise<WorkDay[]> {
  return db.workDays.orderBy('data').reverse().toArray();
}

// ---------- WorkProfile (singleton) ----------

export const DEFAULT_PROFILE: WorkProfile = {
  id: 'work',
  nome: '',
  tariffaOraria: 15,
  aliquotaIRPEF: 23,
  aliquotaINPS: 9.19,
  oreDefaultGiornata: 8,
  ruolo: 'dipendente',
  updatedAt: 0,
};

export async function getWorkProfile(): Promise<WorkProfile> {
  return (await db.workProfiles.get('work')) ?? DEFAULT_PROFILE;
}

export async function saveWorkProfile(
  data: Omit<WorkProfile, 'updatedAt'>,
): Promise<void> {
  await db.workProfiles.put({ ...data, updatedAt: now() });
}
