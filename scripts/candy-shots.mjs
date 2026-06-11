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
  ['04-journal', '#/diario'],
  ['05-notes', '#/note'],
  ['06-projects', '#/progetti'],
  ['07-goals', '#/obiettivi'],
  ['08-weight', '#/peso'],
  ['09-finances', '#/finanze'],
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

    // Seed a few demo notes (the demo loader predates the Notes module).
    await page.evaluate(async () => {
      const NOTES = [
        { title: 'Spesa settimana', body: '', color: '#10b981', pinned: true,
          checklist: [['Pane integrale', true], ['Avocado', true], ['Yogurt greco', false], ['Caffè', false], ['Spinaci', false]] },
        { title: 'Idee app Vyta', body: 'Widget meteo + frase del giorno sulla lock screen. Tema “sunset”.', color: '#8b5cf6', pinned: true, checklist: [] },
        { title: 'Allenamento', body: '', color: '#ff6b57', pinned: false,
          checklist: [['Riscaldamento 10’', true], ['Panca 4x8', false], ['Trazioni 3x10', false], ['Stretching', false]] },
        { title: 'Viaggio Lisbona', body: 'Volo 14 giu · ostello a Alfama. Provare i pastéis de nata!', color: '#e0992f', pinned: false, checklist: [] },
        { title: 'Regali', body: '', color: '#ec4899', pinned: false,
          checklist: [['Mamma — sciarpa', true], ['Luca — libro', false], ['Sara — candela', false]] },
        { title: 'Note riunione', body: 'Decidere prezzo abbonamento. Lanciare v1.2 venerdì. Beta TestFlight a 10 amici.', color: '#3b82f6', pinned: false, checklist: [] },
      ];
      const req = indexedDB.open('vita');
      const dbReq = await new Promise((res) => { req.onsuccess = () => res(req.result); });
      if (![...dbReq.objectStoreNames].includes('notes')) return;
      const now = Date.now();
      const uid = (p) => p + Math.random().toString(36).slice(2, 10);
      const rows = NOTES.map((n, i) => ({
        id: uid('not_'), title: n.title, body: n.body, color: n.color, pinned: n.pinned,
        checklist: n.checklist.map(([text, done]) => ({ id: uid('chk_'), text, done })),
        createdAt: now - i * 1000, updatedAt: now - i * 1000,
      }));
      await new Promise((res, rej) => {
        const tx = dbReq.transaction('notes', 'readwrite');
        const store = tx.objectStore('notes');
        rows.forEach((r) => store.put(r));
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
      });
    });
    await sleep(800);
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
