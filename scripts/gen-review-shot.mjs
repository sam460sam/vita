// Generate an iPhone-sized App Review screenshot (1290 x 2796, 6.7") of the
// subscription / Pro page — for the IAP "Review Information → Screenshot" field.
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../store/cover');
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:5051/';
const todayISO = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
// 430 x 932 logical @3x = 1290 x 2796 (iPhone 6.7").
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });
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
await sleep(800);
await page.evaluate(() => { location.hash = '#/pro'; window.scrollTo(0, 0); });
await sleep(1500);
await page.screenshot({ path: resolve(OUT, 'vyta-review-1290x2796.png') });
await browser.close();
console.log('review shot →', resolve(OUT, 'vyta-review-1290x2796.png'));
