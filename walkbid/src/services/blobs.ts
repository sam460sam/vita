// Blob store — the only place binary data (photos, signatures, PDFs, audio,
// logo) is persisted. Rows reference blobs by id; never base64 in records.
import { db, now, uid } from '@/data/db';
import type { BlobKind, BlobRecord, ID } from '@/data/types';

export async function putBlob(kind: BlobKind, data: Blob, mime?: string): Promise<ID> {
  const id = uid('blb_');
  const rec: BlobRecord = { id, kind, mime: mime ?? data.type ?? 'application/octet-stream', data, createdAt: now() };
  await db.blobs.put(rec);
  return id;
}

export async function getBlob(id: ID): Promise<BlobRecord | undefined> {
  return db.blobs.get(id);
}

/** Object URL for rendering an image/pdf blob. Caller must revoke when done. */
export async function blobUrl(id: ID | undefined): Promise<string | undefined> {
  if (!id) return undefined;
  const rec = await db.blobs.get(id);
  return rec ? URL.createObjectURL(rec.data) : undefined;
}

export async function deleteBlob(id: ID | undefined): Promise<void> {
  if (id) await db.blobs.delete(id);
}

/** Remove blobs no longer referenced by any record (called after deletes). */
export async function pruneBlob(...ids: Array<ID | undefined>): Promise<void> {
  for (const id of ids) if (id) await db.blobs.delete(id);
}
