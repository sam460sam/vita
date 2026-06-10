import { db, now, uid } from './db';
import type { Note, NoteProject } from './types';

export const INBOX_ID = 'inbox';

// ---------- Notes ----------

export async function getNotes(projectId?: string): Promise<Note[]> {
  const q = projectId
    ? db.notes.where('projectId').equals(projectId)
    : db.notes.orderBy('updatedAt');
  return q.reverse().toArray();
}

export async function getNotesByDate(date: string): Promise<Note[]> {
  return db.notes.where('data').equals(date).reverse().sortBy('updatedAt');
}

export async function getInAgendaNotes(): Promise<Note[]> {
  return db.notes.where('inAgenda').equals(1).reverse().sortBy('updatedAt');
}

export async function getNotesByCantiere(cantiereId: string): Promise<Note[]> {
  return db.notes.where('cantiereId').equals(cantiereId).reverse().sortBy('updatedAt');
}

export async function searchNotes(query: string): Promise<Note[]> {
  const q = query.toLowerCase();
  const all = await db.notes.orderBy('updatedAt').reverse().toArray();
  return all.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.includes(q)),
  );
}

export async function saveNote(
  data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = data.id ? await db.notes.get(data.id) : undefined;
  const id = data.id ?? uid('note_');
  await db.notes.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  });
  return id;
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

// ---------- NoteProjects ----------

export async function getNoteProjects(): Promise<NoteProject[]> {
  return db.noteProjects.orderBy('updatedAt').reverse().toArray();
}

export async function saveNoteProject(
  data: Omit<NoteProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = data.id ? await db.noteProjects.get(data.id) : undefined;
  const id = data.id ?? uid('np_');
  await db.noteProjects.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  });
  return id;
}

export async function deleteNoteProject(id: string): Promise<void> {
  await db.noteProjects.delete(id);
}

/** Ensure the "Generale" inbox project always exists. */
export async function ensureInboxProject(): Promise<void> {
  const existing = await db.noteProjects.get(INBOX_ID);
  if (!existing) {
    await db.noteProjects.put({
      id: INBOX_ID,
      nome: 'Generale',
      colore: '#ea580c',
      createdAt: now(),
      updatedAt: now(),
    });
  }
}

/**
 * Get (or create) the NoteProject linked to a specific Cantiere.
 * This ensures each cantiere has a matching note project for integration.
 */
export async function getOrCreateProjectForCantiere(
  cantiereId: string,
  cantiereName: string,
): Promise<NoteProject> {
  const existing = await db.noteProjects.where('cantiereId').equals(cantiereId).first();
  if (existing) return existing;
  const id = uid('np_');
  const project: NoteProject = {
    id,
    nome: cantiereName,
    colore: '#2563eb',
    cantiereId,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.noteProjects.put(project);
  return project;
}
