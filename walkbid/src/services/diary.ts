import { db, now, uid } from '@/data/db';
import { todayISO } from '@/lib/format';
import type { DiaryEntry, ID } from '@/data/types';

export async function diaryForProject(projectId: ID): Promise<DiaryEntry[]> {
  const rows = await db.diaryEntries.where('projectId').equals(projectId).toArray();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

/** Pre-allocate an entry id so photos can reference it before the entry saves. */
export const newDiaryId = (): ID => uid('dia_');

export async function createDiaryEntry(
  data: { id?: ID; projectId: ID; text: string; date?: string; audioBlobId?: ID; photoIds?: ID[] },
): Promise<DiaryEntry> {
  const entry: DiaryEntry = {
    id: data.id ?? uid('dia_'),
    projectId: data.projectId,
    date: data.date ?? todayISO(),
    text: data.text.trim(),
    audioBlobId: data.audioBlobId,
    photoIds: data.photoIds ?? [],
    createdAt: now(),
  };
  await db.diaryEntries.put(entry);
  return entry;
}

export async function addPhotoToEntry(entryId: ID, photoId: ID): Promise<void> {
  const e = await db.diaryEntries.get(entryId);
  if (e) await db.diaryEntries.put({ ...e, photoIds: [...e.photoIds, photoId] });
}

export async function deleteDiaryEntry(id: ID): Promise<void> {
  await db.diaryEntries.delete(id);
}
