// Capture the candy/pastel restyle from the real built app.
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../store/candy');
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:5051/';
const todayISO = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SHOTS = [
  ['01-home', '#/oggi'],
  ['02-habits', '#/abitudini'],
  ['03-activity', '#/attivita'],
  ['04-finances', '#/finanze'],
  ['05-journal', '#/diario'],
  ['06-projects', '#/progetti'],
  ['08-goals', '#/obiettivi'],
  ['09-weight', '#/peso'],
  ['10-more', '#/altro'],
  ['11-rewards', '#/premi'],
  ['12-recap', '#/recap'],
];

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

async function run(theme) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  page.on('dialog', async (d) => { try { await d.accept(); } catch { /* */ } });

  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.evaluate((today, th) => {
    localStorage.setItem('vita.onboarded', '1');
    localStorage.setItem('vita.theme', th);
    localStorage.setItem('vita.lang', 'it');
    localStorage.setItem('vita.dailywin.shown', today);
    localStorage.setItem('vita.backup.lastAt', String(Date.now()));
  }, todayISO, theme);
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await sleep(800);

  // Seed demo data once (light pass only — DB is shared).
  if (theme === 'light') {
    await page.evaluate(() => { location.hash = '#/impostazioni'; });
    await sleep(1200);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Carica dati demo'));
      if (b) b.click();
    });
    await sleep(6000);
  }

  for (const [name, hash] of SHOTS) {
    await page.evaluate((h) => { location.hash = h; window.scrollTo(0, 0); }, hash);
    await sleep(1800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);
    await page.screenshot({ path: resolve(OUT, `${theme}-${name}.png`) });
    console.log('captured', theme, name);
  }

  // Stella assistant panel.
  await page.evaluate(() => { location.hash = '#/oggi'; });
  await sleep(1200);
  const opened = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Aiutante di Vyta');
    if (b) { b.click(); return true; }
    return false;
  });
  await sleep(1400);
  await page.screenshot({ path: resolve(OUT, `${theme}-07-stella.png`) });
  console.log('captured', theme, 'stella', opened);

  await page.close();
}

await run('light');
await run('dark');
await browser.close();
console.log('done →', OUT);
