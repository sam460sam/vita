import { db, now, uid } from './db';
import type { Cantiere, Operaio } from './types';

// --- Cantieri ---

export const getCantieri = () => db.cantieri.orderBy('updatedAt').reverse().toArray();

export const getCantiere = (id: string) => db.cantieri.get(id);

export async function saveCantiere(
  data: Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = data.id ? await db.cantieri.get(data.id) : undefined;
  const id = data.id ?? uid('can_');
  await db.cantieri.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  });
  return id;
}

export async function deleteCantiere(id: string) {
  await db.cantieri.delete(id);
}

// --- Operai ---

export const getOperai = () => db.operai.orderBy('nome').toArray();

export async function saveOperaio(
  data: Omit<Operaio, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = data.id ? await db.operai.get(data.id) : undefined;
  const id = data.id ?? uid('ope_');
  await db.operai.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  });
  return id;
}

export async function deleteOperaio(id: string) {
  await db.operai.delete(id);
}
