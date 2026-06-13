// Demo data seeder for screenshots/marketing only. Exposed on window in dev so
// the screenshot script can populate a realistic, deterministic state. Never
// imported by the app UI.
import { db } from '@/data/db';
import { seedPriceBook } from '@/data/seed';
import { updateCompany, updateSettings } from './settings';
import { createClient } from './clients';
import { createProject } from './projects';
import { getOrCreateEstimate, addItem } from './estimates';
import { replacePlan, markPaid } from './payments';
import { listPriceBook } from './priceBook';
import { setProjectStatus } from './projects';
import { signContract } from './contracts';
import { createChangeOrder, signChangeOrder } from './changeOrders';

/** A realistic signature PNG so signed docs verify their own SHA-256. */
async function signatureBlob(): Promise<Blob> {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 120;
  const x = c.getContext('2d')!;
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, 320, 120);
  x.strokeStyle = '#0E1013';
  x.lineWidth = 3;
  x.lineCap = 'round';
  x.beginPath();
  x.moveTo(20, 90);
  x.bezierCurveTo(70, 10, 110, 115, 160, 60);
  x.bezierCurveTo(205, 15, 250, 105, 300, 45);
  x.stroke();
  return await new Promise((r) => c.toBlob((b) => r(b!), 'image/png'));
}

export async function seedDemo(): Promise<void> {
  // Reset (demo only), then restore the seed price book.
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.priceBook.bulkPut(seedPriceBook());
  await updateCompany({
    name: 'Elite Hardscapes LLC',
    licenseNumber: '#438F829',
    address: 'Austin, TX',
    phone: '(748) 490-9922',
    email: 'hello@elitehardscapes.com',
    paymentInstructions: 'Zelle: pay@elitehardscapes.com · Checks payable to Elite Hardscapes LLC',
  });
  await updateSettings({ defaultTaxRate: 0, defaultMarkupRate: 0.1 });

  const adam = await createClient({ name: 'Adam Appleseed', company: 'Appleseed Residence', phone: '(512) 555-0148', email: 'adam@example.com' });
  const maria = await createClient({ name: 'María González', phone: '(512) 555-0192', language: 'es' });
  const dwyer = await createClient({ name: 'Dwyer Property Group', company: 'Dwyer PG' });

  // Signed, in-progress job with a healthy milestone bar.
  const patio = await createProject({ clientId: adam.id, title: 'Backyard paver patio', siteAddress: '123 Oak St, Austin TX', status: 'in_progress' });
  const est = await getOrCreateEstimate(patio.id);
  const pb = await listPriceBook(true);
  const pick = (code: string) => pb.find((p) => p.code === code)!;
  await addItem(est.id, { description: 'Excavation & grading', qty: 18, unit: 'cy', unitPrice: pick('EX01').unitPrice, priceBookId: pick('EX01').id });
  await addItem(est.id, { description: 'Crushed gravel base 6", supplied & compacted', qty: 480, unit: 'sf', unitPrice: pick('GB01').unitPrice, priceBookId: pick('GB01').id });
  await addItem(est.id, { description: 'Paver installation (labor)', qty: 480, unit: 'sf', unitPrice: pick('PV01').unitPrice, priceBookId: pick('PV01').id });
  await addItem(est.id, { description: 'Paver material, standard concrete pavers', qty: 480, unit: 'sf', unitPrice: pick('PV02').unitPrice, priceBookId: pick('PV02').id });
  await addItem(est.id, { description: 'Edge restraint', qty: 92, unit: 'lf', unitPrice: pick('ED01').unitPrice, priceBookId: pick('ED01').id });
  await addItem(est.id, { description: 'Catch basin with grate', qty: 2, unit: 'ea', unitPrice: pick('CB01').unitPrice, priceBookId: pick('CB01').id });

  const fresh = await db.estimates.get(est.id);
  const total = fresh?.total ?? 8500;
  await replacePlan(patio.id, [
    { label: 'deposit', amount: Math.round(total * 0.3), dueRule: { type: 'event', event: 'signature' } },
    { label: 'progress', amount: Math.round(total * 0.35), dueRule: { type: 'event', event: 'completion' } },
    { label: 'final', amount: total - Math.round(total * 0.3) - Math.round(total * 0.35), dueRule: { type: 'event', event: 'completion' } },
  ]);
  const pays = await db.payments.where('projectId').equals(patio.id).toArray();
  const deposit = pays.find((p) => p.label === 'deposit');
  if (deposit) await markPaid(deposit.id, 'Zelle');

  // Real signed contract via the actual pipeline → verifiable SHA-256.
  const geo = { lat: 30.2672, lng: -97.7431 };
  const freshEst = (await db.estimates.get(est.id))!;
  await signContract(patio.id, { estimate: freshEst, signerName: 'Adam Appleseed', signerRole: 'Client', signaturePng: await signatureBlob(), geo });
  await setProjectStatus(patio.id, 'in_progress'); // keep pipeline variety

  // Real signed change order (auto-creates the extra payment row) — the wedge.
  const co = await createChangeOrder({
    projectId: patio.id,
    title: 'Extend patio 2 ft along east edge',
    description: 'Client requested extending the patio 2 ft along the east edge, adding base, pavers and edge restraint.',
    items: [
      { description: 'Paver installation (labor)', qty: 80, unit: 'sf', unitPrice: pick('PV01').unitPrice, priceBookId: pick('PV01').id },
      { description: 'Paver material, standard concrete pavers', qty: 80, unit: 'sf', unitPrice: pick('PV02').unitPrice, priceBookId: pick('PV02').id },
      { description: 'Edge restraint', qty: 16, unit: 'lf', unitPrice: pick('ED01').unitPrice, priceBookId: pick('ED01').id },
    ],
  });
  await signChangeOrder(co.id, { signerName: 'Adam Appleseed', signerRole: 'Client', signaturePng: await signatureBlob(), geo });

  // Pipeline variety.
  await createProject({ clientId: maria.id, title: 'Driveway replacement', siteAddress: '88 Cedar Ave, Austin TX', status: 'quoted' });
  await createProject({ clientId: dwyer.id, title: 'Retaining wall + drainage', siteAddress: '14 Hillside Dr', status: 'lead' });
  await createProject({ clientId: adam.id, title: 'Front walkway sealing', siteAddress: '123 Oak St', status: 'done' });
}

declare global {
  interface Window {
    __walkbidSeedDemo?: () => Promise<void>;
  }
}

if (import.meta.env?.DEV) {
  window.__walkbidSeedDemo = seedDemo;
}
