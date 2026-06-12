import { db, now, uid } from '@/data/db';
import type { Client, ID } from '@/data/types';

export async function listClients(): Promise<Client[]> {
  return db.clients.orderBy('name').toArray();
}

export async function getClient(id: ID): Promise<Client | undefined> {
  return db.clients.get(id);
}

export async function createClient(data: Pick<Client, 'name'> & Partial<Client>): Promise<Client> {
  const client: Client = {
    id: uid('cli_'),
    name: data.name.trim(),
    company: data.company,
    phone: data.phone,
    email: data.email,
    address: data.address,
    notes: data.notes,
    language: data.language ?? 'en',
    createdAt: now(),
  };
  await db.clients.put(client);
  return client;
}

export async function updateClient(id: ID, patch: Partial<Client>): Promise<void> {
  const c = await db.clients.get(id);
  if (!c) return;
  await db.clients.put({ ...c, ...patch });
}

/** Delete a client. Blocked in the UI if they still have jobs. */
export async function deleteClient(id: ID): Promise<void> {
  await db.clients.delete(id);
}

export async function clientProjectCount(id: ID): Promise<number> {
  return db.projects.where('clientId').equals(id).count();
}
