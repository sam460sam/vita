import { db, now, uid } from '@/data/db';
import { getSettings } from './settings';
import { itemsForEstimate } from './estimates';
import { paymentsForProject } from './payments';
import { buildContractPdf } from './pdf/contractPdf';
import { putBlob, getBlob } from './blobs';
import { sha256Hex } from '@/lib/hash';
import { setProjectStatus } from './projects';
import { deviceModel } from '@/platform/native';
import type { Contract, Estimate, Geo, ID } from '@/data/types';

export async function contractForProject(projectId: ID): Promise<Contract | undefined> {
  return db.contracts.where('projectId').equals(projectId).first();
}

interface SignInput {
  estimate: Estimate;
  signerName: string;
  signerRole: string;
  signaturePng: Blob;
  geo?: Geo;
}

/**
 * Convert an accepted estimate into a signed contract: render the final PDF
 * (with the embedded signature), SHA-256 the exact bytes, persist the PDF blob
 * + digest, and flip the project to "signed". Fully offline.
 */
export async function signContract(projectId: ID, input: SignInput): Promise<Contract> {
  const { estimate } = input;
  const [settings, project, items, payments] = await Promise.all([
    getSettings(),
    db.projects.get(projectId),
    itemsForEstimate(estimate.id),
    paymentsForProject(projectId),
  ]);
  if (!project) throw new Error('Project not found');
  const client = await db.clients.get(project.clientId);
  if (!client) throw new Error('Client not found');

  const signatureBlobId = await putBlob('signature', input.signaturePng, 'image/png');
  const pngBytes = new Uint8Array(await input.signaturePng.arrayBuffer());
  const signedAt = now();
  const device = deviceModel();

  const existing = await contractForProject(projectId);
  const contract: Contract = {
    id: existing?.id ?? uid('con_'),
    projectId,
    estimateId: estimate.id,
    signerName: input.signerName,
    signerRole: input.signerRole,
    signatureBlobId,
    signedAt,
    geo: input.geo,
    deviceModel: device,
    status: 'signed',
    createdAt: existing?.createdAt ?? signedAt,
  };

  // Render the final, signed PDF then hash its exact bytes.
  const blob = await buildContractPdf({
    company: settings.company,
    project,
    client,
    estimate,
    items,
    payments,
    contract,
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
  const sha256 = await sha256Hex(blob);
  const pdfBlobId = await putBlob('pdf', blob, 'application/pdf');

  contract.sha256 = sha256;
  contract.pdfBlobId = pdfBlobId;
  await db.contracts.put(contract);
  await db.estimates.put({ ...estimate, status: 'accepted' });
  await setProjectStatus(projectId, 'signed');
  return contract;
}

export interface IntegrityResult {
  ok: boolean;
  stored?: string;
  recomputed?: string;
}

/** Recompute the stored PDF's hash and compare — proves the doc is unaltered. */
export async function verifyContract(contract: Contract): Promise<IntegrityResult> {
  if (!contract.pdfBlobId || !contract.sha256) return { ok: false };
  const rec = await getBlob(contract.pdfBlobId);
  if (!rec) return { ok: false, stored: contract.sha256 };
  const recomputed = await sha256Hex(rec.data);
  return { ok: recomputed === contract.sha256, stored: contract.sha256, recomputed };
}
