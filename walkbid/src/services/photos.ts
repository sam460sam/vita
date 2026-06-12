import { db, now, uid } from '@/data/db';
import { putBlob, deleteBlob } from './blobs';
import { capturePhoto } from '@/platform/camera';
import { currentGeo } from '@/platform/geo';
import type { ID, Photo, PhotoRefType } from '@/data/types';

/** Take a photo, auto geotag + timestamp, store the blob, return the record. */
export async function takePhoto(projectId: ID, refType: PhotoRefType, refId: ID, caption?: string): Promise<Photo | null> {
  const blob = await capturePhoto();
  if (!blob) return null;
  const [blobId, geo] = await Promise.all([putBlob('photo', blob, blob.type || 'image/jpeg'), currentGeo()]);
  const photo: Photo = { id: uid('pho_'), projectId, refType, refId, blobId, takenAt: now(), geo, caption };
  await db.photos.put(photo);
  return photo;
}

export async function photosForRef(refType: PhotoRefType, refId: ID): Promise<Photo[]> {
  const rows = await db.photos.where('refId').equals(refId).toArray();
  return rows.filter((p) => p.refType === refType).sort((a, b) => a.takenAt - b.takenAt);
}

export async function photosForProject(projectId: ID): Promise<Photo[]> {
  return db.photos.where('projectId').equals(projectId).sortBy('takenAt');
}

export async function getPhotos(ids: ID[]): Promise<Photo[]> {
  const rows = await Promise.all(ids.map((id) => db.photos.get(id)));
  return rows.filter((p): p is Photo => !!p);
}

export async function setCaption(id: ID, caption: string): Promise<void> {
  const p = await db.photos.get(id);
  if (p) await db.photos.put({ ...p, caption });
}

export async function deletePhoto(id: ID): Promise<void> {
  const p = await db.photos.get(id);
  if (!p) return;
  await deleteBlob(p.blobId);
  await db.photos.delete(id);
}
