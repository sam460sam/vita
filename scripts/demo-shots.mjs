// Demo screenshot capture: serves the production build, seeds demo data in the
// browser, and snaps each module at a phone viewport.
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../demo');
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE_URL || 'http://localhost:4173';

const shots = [
  { name: '01-oggi', hash: '#/oggi' },
  { name: '02-attivita', hash: '#/attivita' },
  { name: '03-progetti', hash: '#/progetti' },
  { name: '04-abitudini', hash: '#/abitudini' },
  { name: '05-diario', hash: '#/diario' },
  { name: '06-obiettivi', hash: '#/obiettivi' },
  { name: '07-finanze', hash: '#/finanze' },
  { name: '08-calendario', hash: '#/calendario' },
  { name: '09-altro', hash: '#/altro' },
  { name: '10-impostazioni', hash: '#/impostazioni' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

// Load app, then seed demo data directly via the app's module.
await page.goto(`${BASE}/${shots[0].hash}`, { waitUntil: 'networkidle0' });
await sleep(800);

// Seed by importing the built seed through the app's global (fallback: UI button).
await page.evaluate(async () => {
  // The app doesn't expose seed globally; drive the Settings UI instead.
});

// Navigate to settings and click "Carica dati demo", auto-accepting confirm.
page.on('dialog', async (d) => {
  await d.accept();
});
await page.goto(`${BASE}/#/impostazioni`, { waitUntil: 'networkidle0' });
await sleep(1500); // settings is lazy-loaded
let clicked = false;
for (let i = 0; i < 10 && !clicked; i++) {
  clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Carica dati demo'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (!clicked) await sleep(400);
}
console.log('demo button clicked:', clicked);
await sleep(3000); // let the seed transaction finish

for (const s of shots) {
  await page.goto(`${BASE}/${s.hash}`, { waitUntil: 'networkidle0' });
  await sleep(900); // allow rings/animations to settle
  // Open a project detail for a richer projects shot
  await page.screenshot({ path: resolve(OUT, `${s.name}.png`) });
  console.log('captured', s.name);
}

// Bonus: project detail (kanban) + quick-add menu
await page.goto(`${BASE}/#/progetti`, { waitUntil: 'networkidle0' });
await sleep(700);
const opened = await page.evaluate(() => {
  const link = document.querySelector('a[href*="/progetti/"]');
  if (link) {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }
  return false;
});
if (opened) {
  await sleep(900);
  await page.screenshot({ path: resolve(OUT, '11-progetto-dettaglio.png') });
  console.log('captured 11-progetto-dettaglio');
}

await browser.close();
console.log('done');
