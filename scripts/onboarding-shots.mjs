// Capture the redesigned first-access onboarding flow.
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../store/onboarding');
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:5051/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'networkidle2' });
await page.evaluate(() => { localStorage.removeItem('vita.onboarded'); localStorage.setItem('vita.theme', 'light'); localStorage.setItem('vita.lang', 'it'); });
await page.goto(BASE, { waitUntil: 'networkidle2' });
await sleep(1000);

async function shot(name) { await page.screenshot({ path: resolve(OUT, name + '.png') }); console.log('shot', name); }
async function clickText(txt) {
  await page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t || x.textContent.includes(t));
    if (b) b.click();
  }, txt);
  await sleep(700);
}

await shot('1-lang');
await clickText('Italiano');
await clickText('Avanti');
await shot('2-welcome');
await clickText('Avanti');
await shot('3-why');
await clickText('Avanti');
await shot('4-focus');
await clickText('Avanti');
await shot('5-modules');
await clickText('Avanti');
await shot('6-habits');
await clickText('Avanti');
await shot('7-name');
await clickText('Avanti');
await shot('8-aha');

await browser.close();
console.log('done →', OUT);
