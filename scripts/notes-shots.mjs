// Capture the new native Notes module (list + editor) from the built app.
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../store/notes');
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:5051/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

async function run(theme) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.evaluate((th) => {
    localStorage.setItem('vita.onboarded', '1');
    localStorage.setItem('vita.theme', th);
    localStorage.setItem('vita.lang', 'it');
  }, theme);
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await sleep(800);

  // Seed notes directly into IndexedDB via Dexie (light pass only — DB shared).
  if (theme === 'light') {
    await page.evaluate(async (notes) => {
      const req = indexedDB.open('vita');
      const dbReq = await new Promise((res) => { req.onsuccess = () => res(req.result); });
      const now = Date.now();
      const uid = (p) => p + Math.random().toString(36).slice(2, 10);
      const rows = notes.map((n, i) => ({
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
    }, NOTES);
    await sleep(400);
  }

  // List
  await page.evaluate(() => { location.hash = '#/note'; window.scrollTo(0, 0); });
  await sleep(1500);
  await page.screenshot({ path: resolve(OUT, `${theme}-list.png`) });
  console.log('captured', theme, 'list');

  // Editor (tap first note card)
  if (theme === 'light') {
    await page.evaluate(() => {
      const card = document.querySelector('.columns-2 button');
      if (card) card.click();
    });
    await sleep(1200);
    await page.screenshot({ path: resolve(OUT, `${theme}-editor.png`) });
    console.log('captured', theme, 'editor');
  }

  await page.close();
}

await run('light');
await run('dark');
await browser.close();
console.log('done →', OUT);
