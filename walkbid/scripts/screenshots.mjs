// Drives the real WalkBid app with seeded demo data and captures App Store
// screenshots at iPhone 6.7" (1290×2796). Requires the dev server running on
// :5173. Run: node scripts/screenshots.mjs
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const BASE = process.env.WB_URL || 'http://localhost:5173';
const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../store/screenshots');
mkdirSync(OUT, { recursive: true });

// 6.7" logical 430×932 @3x = 1290×2796 (App Store iPhone 6.7" requirement).
const VIEW = { width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SHOTS = [
  { file: '01-jobs', hash: '#/jobs', wait: 900 },
  { file: '02-project-estimate', hash: '#/jobs/__PATIO__?tab=estimate', wait: 900 },
  { file: '03-contract-audit', hash: '#/jobs/__PATIO__?tab=contract', wait: 1100 },
  { file: '04-change-orders', hash: '#/jobs/__PATIO__?tab=changeOrders', wait: 900 },
  { file: '05-payments', hash: '#/jobs/__PATIO__?tab=payments', wait: 900 },
  { file: '06-price-book', hash: '#/price-book', wait: 800 },
];

const run = async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport(VIEW);

  // Load app, seed demo data, read back the patio project id.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await page.waitForFunction('typeof window.__walkbidSeedDemo === "function"', { timeout: 15000 });
  const patioId = await page.evaluate(async () => {
    await window.__walkbidSeedDemo();
    const dbReq = indexedDB.open('walkbid');
    return await new Promise((res) => {
      dbReq.onsuccess = () => {
        const db = dbReq.result;
        const tx = db.transaction('projects', 'readonly').objectStore('projects').getAll();
        tx.onsuccess = () => {
          const p = tx.result.find((x) => x.title === 'Backyard paver patio');
          res(p ? p.id : '');
        };
      };
    });
  });

  for (const shot of SHOTS) {
    const hash = shot.hash.replace('__PATIO__', patioId);
    await page.evaluate((h) => {
      window.location.hash = h;
    }, hash);
    await sleep(shot.wait);
    await page.screenshot({ path: resolve(OUT, `${shot.file}.png`) });
    console.log('✓', shot.file);
  }

  await browser.close();
  console.log('Screenshots written to', OUT);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
