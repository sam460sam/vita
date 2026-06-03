// Generate App Store screenshots from the real app, at iPhone 6.5" size
// (1242 x 2688). Serves the built app, seeds demo data, captures key screens.
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../store/screenshots');
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:5051/';
const todayISO = new Date().toISOString().slice(0, 10);

const SHOTS = [
  ['01-home', '#/oggi'],
  ['02-habits', '#/abitudini'],
  ['03-recap', '#/recap'],
  ['04-rewards', '#/premi'],
  ['05-finances', '#/finanze'],
  ['06-activity', '#/attivita'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 3 });
page.on('dialog', async (d) => { try { await d.accept(); } catch { /* */ } });

// First load, set preferences, reload so the inline theme script applies light.
await page.goto(BASE, { waitUntil: 'networkidle2' });
await page.evaluate((today) => {
  localStorage.setItem('vita.onboarded', '1');
  localStorage.setItem('vita.theme', 'light');
  localStorage.setItem('vita.lang', 'it');
  localStorage.setItem('vita.dailywin.shown', today); // suppress celebration overlay
  localStorage.setItem('vita.backup.lastAt', String(Date.now())); // suppress backup nudge
}, todayISO);
await page.goto(BASE, { waitUntil: 'networkidle2' });
await sleep(1000);

// Seed demo data via Settings → "Carica dati demo".
await page.evaluate(() => { location.hash = '#/impostazioni'; });
await sleep(1500);
const clicked = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Carica dati demo'));
  if (b) { b.click(); return true; }
  return false;
});
console.log('demo button clicked:', clicked);
await sleep(6000); // let the seed finish writing to IndexedDB

// Re-assert suppression flags (seed clears DB, not localStorage, but be safe).
await page.evaluate((today) => {
  localStorage.setItem('vita.dailywin.shown', today);
  localStorage.setItem('vita.backup.lastAt', String(Date.now()));
}, todayISO);

for (const [name, hash] of SHOTS) {
  await page.evaluate((h) => { location.hash = h; window.scrollTo(0, 0); }, hash);
  await sleep(2200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: resolve(OUT, `${name}.png`) });
  console.log('captured', name);
}

await browser.close();
console.log('Screenshots in store/screenshots/');
