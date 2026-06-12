import { db } from '@/data/db';
import { getSettings } from './settings';
import { changeOrdersForProject } from './changeOrders';
import { paymentsForProject } from './payments';
import { diaryForProject } from './diary';
import { photosForProject } from './photos';
import { contractForProject } from './contracts';
import { getBlob } from './blobs';
import { buildProofPdf, type ProofData } from './pdf/proofPdf';
import { shareFile } from '@/platform/share';
import { BRAND } from '@/config/brand';
import { todayISO } from '@/lib/format';
import type { ID } from '@/data/types';

function safeName(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'job';
}

export async function buildProofBlob(projectId: ID): Promise<Blob | null> {
  const project = await db.projects.get(projectId);
  if (!project) return null;
  const [settings, client, contract, changeOrders, payments, diary, photoRecs] = await Promise.all([
    getSettings(),
    db.clients.get(project.clientId),
    contractForProject(projectId),
    changeOrdersForProject(projectId),
    paymentsForProject(projectId),
    diaryForProject(projectId),
    photosForProject(projectId),
  ]);
  if (!client) return null;

  const photos: ProofData['photos'] = [];
  for (const photo of photoRecs) {
    const rec = await getBlob(photo.blobId);
    if (!rec) continue;
    photos.push({ photo, bytes: new Uint8Array(await rec.data.arrayBuffer()), mime: rec.mime });
  }

  return buildProofPdf({ company: settings.company, project, client, contract, changeOrders, payments, diary, photos });
}

export async function shareProof(projectId: ID): Promise<boolean> {
  const blob = await buildProofBlob(projectId);
  if (!blob) return false;
  const project = await db.projects.get(projectId);
  const filename = `PROOF_${safeName(project?.title ?? '')}_${todayISO()}.pdf`;
  await shareFile(filename, blob, `Proof package — ${project?.title ?? BRAND}`);
  return true;
}
