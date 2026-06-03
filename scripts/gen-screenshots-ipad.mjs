// iPad 13" App Store screenshots (2048 x 2732). Same flow as the iPhone script.
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../store/screenshots-ipad');
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:5051/';
const todayISO = new Date().toISOString().slice(0, 10);
const SHOTS = [
  ['01-home', '#/oggi'],
  ['02-habits', '#/abitudini'],
  ['03-recap', '#/recap'],
  ['04-rewards', '#/premi'],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
await page.setViewport({ width: 1024, height: 1366, deviceScaleFactor: 2 });
page.on('dialog', async (d) => { try { await d.accept(); } catch { /* */ } });

await page.goto(BASE, { waitUntil: 'networkidle2' });
await page.evaluate((today) => {
  localStorage.setItem('vita.onboarded', '1');
  localStorage.setItem('vita.theme', 'light');
  localStorage.setItem('vita.lang', 'it');
  localStorage.setItem('vita.dailywin.shown', today);
  localStorage.setItem('vita.backup.lastAt', String(Date.now()));
}, todayISO);
await page.goto(BASE, { waitUntil: 'networkidle2' });
await sleep(1000);

await page.evaluate(() => { location.hash = '#/impostazioni'; });
await sleep(1500);
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Carica dati demo'));
  if (b) b.click();
});
await sleep(6000);
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
console.log('iPad screenshots in store/screenshots-ipad/');
