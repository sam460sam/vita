import { db, now, uid } from '@/data/db';
import { getSettings } from './settings';
import { round2, lineTotal } from './estimates';
import { contractForProject } from './contracts';
import { createExtraForChangeOrder } from './payments';
import { buildChangeOrderPdf } from './pdf/changeOrderPdf';
import { putBlob, getBlob } from './blobs';
import { sha256Hex } from '@/lib/hash';
import { deviceModel } from '@/platform/native';
import type { ChangeOrder, CoItem, Geo, ID, Unit } from '@/data/types';

export interface DraftCoItem {
  description: string;
  qty: number;
  unit: Unit;
  unitPrice: number;
  priceBookId?: ID;
}

export async function changeOrdersForProject(projectId: ID): Promise<ChangeOrder[]> {
  const rows = await db.changeOrders.where('projectId').equals(projectId).toArray();
  return rows.sort((a, b) => a.createdAt - b.createdAt);
}

export async function coItemsFor(changeOrderId: ID): Promise<CoItem[]> {
  const rows = await db.coItems.where('changeOrderId').equals(changeOrderId).toArray();
  return rows.sort((a, b) => a.sort - b.sort);
}

async function nextCoNumber(projectId: ID): Promise<string> {
  const n = await db.changeOrders.where('projectId').equals(projectId).count();
  return `CO-${n + 1}`;
}

export async function createChangeOrder(data: {
  projectId: ID;
  title: string;
  description: string;
  items: DraftCoItem[];
  photoIds?: ID[];
  voiceTranscript?: string;
}): Promise<ChangeOrder> {
  const contract = await contractForProject(data.projectId);
  const items: CoItem[] = data.items.map((it, i) => ({
    id: uid('coi_'),
    changeOrderId: '',
    priceBookId: it.priceBookId,
    description: it.description,
    qty: it.qty,
    unit: it.unit,
    unitPrice: it.unitPrice,
    total: lineTotal(it.qty, it.unitPrice),
    sort: i,
  }));
  const deltaTotal = round2(items.reduce((s, i) => s + i.total, 0));
  const co: ChangeOrder = {
    id: uid('cho_'),
    projectId: data.projectId,
    contractId: contract?.id,
    number: await nextCoNumber(data.projectId),
    title: data.title.trim(),
    description: data.description.trim(),
    deltaTotal,
    status: 'draft',
    photoIds: data.photoIds ?? [],
    voiceTranscript: data.voiceTranscript,
    createdAt: now(),
  };
  await db.transaction('rw', db.changeOrders, db.coItems, async () => {
    await db.changeOrders.put(co);
    await db.coItems.bulkPut(items.map((i) => ({ ...i, changeOrderId: co.id })));
  });
  return co;
}

export async function updateChangeOrder(id: ID, patch: Partial<ChangeOrder>): Promise<void> {
  const c = await db.changeOrders.get(id);
  if (!c) return;
  await db.changeOrders.put({ ...c, ...patch });
}

export async function deleteChangeOrder(id: ID): Promise<void> {
  await db.transaction('rw', db.changeOrders, db.coItems, db.payments, async () => {
    await db.coItems.where('changeOrderId').equals(id).delete();
    await db.payments.where('changeOrderId').equals(id).delete();
    await db.changeOrders.delete(id);
  });
}

interface SignInput {
  signerName: string;
  signerRole: string;
  signaturePng: Blob;
  geo?: Geo;
}

/**
 * Sign a change order on the spot (same pipeline as the contract). Renders the
 * final PDF, SHA-256s the bytes, persists, and auto-creates an `extra` payment
 * row for the delta (spec M4/M8 flow B).
 */
export async function signChangeOrder(id: ID, input: SignInput): Promise<ChangeOrder> {
  const co = await db.changeOrders.get(id);
  if (!co) throw new Error('Change order not found');
  const [settings, project, items] = await Promise.all([getSettings(), db.projects.get(co.projectId), coItemsFor(id)]);
  if (!project) throw new Error('Project not found');
  const client = await db.clients.get(project.clientId);
  if (!client) throw new Error('Client not found');

  const signatureBlobId = await putBlob('signature', input.signaturePng, 'image/png');
  const pngBytes = new Uint8Array(await input.signaturePng.arrayBuffer());
  const signedAt = now();
  const device = deviceModel();

  const signed: ChangeOrder = {
    ...co,
    status: 'signed',
    signerName: input.signerName,
    signerRole: input.signerRole,
    signatureBlobId,
    signedAt,
    geo: input.geo,
    deviceModel: device,
  };

  const blob = await buildChangeOrderPdf({
    company: settings.company,
    project,
    client,
    changeOrder: signed,
    items,
    signature: {
      pngBytes,
      signerName: input.signerName,
      signerRole: input.signerRole,
      signedAt,
      geo: input.geo,
      deviceModel: device,
      sha256: '(computed on save)',
    },
  });
  signed.sha256 = await sha256Hex(blob);
  signed.pdfBlobId = await putBlob('pdf', blob, 'application/pdf');

  await db.changeOrders.put(signed);
  // Auto-create the extra payment row for the signed delta (only if positive).
  if (signed.deltaTotal > 0) await createExtraForChangeOrder(co.projectId, co.id, signed.deltaTotal);
  return signed;
}

export async function verifyChangeOrder(co: ChangeOrder): Promise<boolean> {
  if (!co.pdfBlobId || !co.sha256) return false;
  const rec = await getBlob(co.pdfBlobId);
  if (!rec) return false;
  return (await sha256Hex(rec.data)) === co.sha256;
}
