// Full local backup/restore as a single .zip (JSON + blob binaries). No data
// ever leaves the device unless the user shares the file (spec §3/§12).
import JSZip from 'jszip';
import { db, now } from '@/data/db';
import { shareFile } from '@/platform/share';
import { BRAND } from '@/config/brand';
import { todayISO } from '@/lib/format';
import type { WalkBidBackup } from '@/data/types';

const SCHEMA = 'walkbid';
const VERSION = 1;

async function snapshot(): Promise<{ backup: WalkBidBackup; blobs: Array<{ id: string; kind: string; mime: string; data: Blob }> }> {
  const [settings, clients, projects, priceBook, estimates, estimateItems, contracts, changeOrders, coItems, photos, diaryEntries, payments, blobs] =
    await Promise.all([
      db.settings.get('app'),
      db.clients.toArray(),
      db.projects.toArray(),
      db.priceBook.toArray(),
      db.estimates.toArray(),
      db.estimateItems.toArray(),
      db.contracts.toArray(),
      db.changeOrders.toArray(),
      db.coItems.toArray(),
      db.photos.toArray(),
      db.diaryEntries.toArray(),
      db.payments.toArray(),
      db.blobs.toArray(),
    ]);
  const backup: WalkBidBackup = {
    schema: SCHEMA,
    version: VERSION,
    exportedAt: now(),
    settings: settings ?? null,
    clients,
    projects,
    priceBook,
    estimates,
    estimateItems,
    contracts,
    changeOrders,
    coItems,
    photos,
    diaryEntries,
    payments,
    blobIds: blobs.map((b) => b.id),
  };
  return { backup, blobs: blobs.map((b) => ({ id: b.id, kind: b.kind, mime: b.mime, data: b.data })) };
}

export async function exportBackup(): Promise<void> {
  const { backup, blobs } = await snapshot();
  const zip = new JSZip();
  zip.file('walkbid.json', JSON.stringify(backup));
  zip.file('blobs/_index.json', JSON.stringify(blobs.map(({ id, kind, mime }) => ({ id, kind, mime }))));
  const folder = zip.folder('blobs')!;
  for (const b of blobs) folder.file(b.id, b.data);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  await shareFile(`${BRAND}_backup_${todayISO()}.zip`, zipBlob, `${BRAND} backup`);
}

export async function importBackup(file: Blob): Promise<void> {
  const zip = await JSZip.loadAsync(file);
  const jsonFile = zip.file('walkbid.json');
  if (!jsonFile) throw new Error('Not a WalkBid backup');
  const backup = JSON.parse(await jsonFile.async('string')) as WalkBidBackup;
  if (backup.schema !== SCHEMA) throw new Error('Not a WalkBid backup');

  const index = zip.file('blobs/_index.json');
  const meta: Array<{ id: string; kind: string; mime: string }> = index ? JSON.parse(await index.async('string')) : [];
  const metaById = new Map(meta.map((m) => [m.id, m]));

  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
    if (backup.settings) await db.settings.put(backup.settings);
    await db.clients.bulkPut(backup.clients ?? []);
    await db.projects.bulkPut(backup.projects ?? []);
    await db.priceBook.bulkPut(backup.priceBook ?? []);
    await db.estimates.bulkPut(backup.estimates ?? []);
    await db.estimateItems.bulkPut(backup.estimateItems ?? []);
    await db.contracts.bulkPut(backup.contracts ?? []);
    await db.changeOrders.bulkPut(backup.changeOrders ?? []);
    await db.coItems.bulkPut(backup.coItems ?? []);
    await db.photos.bulkPut(backup.photos ?? []);
    await db.diaryEntries.bulkPut(backup.diaryEntries ?? []);
    await db.payments.bulkPut(backup.payments ?? []);
    for (const id of backup.blobIds ?? []) {
      const f = zip.file(`blobs/${id}`);
      if (!f) continue;
      const data = await f.async('blob');
      const m = metaById.get(id);
      await db.blobs.put({ id, kind: (m?.kind ?? 'photo') as never, mime: m?.mime ?? data.type, data, createdAt: now() });
    }
  });
}
