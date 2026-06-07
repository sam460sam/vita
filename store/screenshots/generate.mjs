// App Store screenshot generator for Vyta.
// Seeds the built app with sample data, captures real screens via headless
// Chrome, and composes them into marketing slides (headline + device frame)
// at 1290x2796 (App Store 6.7"). Output: store/screenshots/out/*.png
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

function serve(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let file = path.join(dir, urlPath);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html');
      const ext = path.extname(file);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, () => resolve(server));
  });
}

const SLIDES = [
  { route: 'oggi', bg: 'linear-gradient(165deg,#EEF2FF,#FCE7F3)', title: 'La tua vita,\norganizzata.' },
  { route: 'abitudini', bg: 'linear-gradient(165deg,#FEF3C7,#FFE4E6)', title: 'Crea abitudini\nche durano.' },
  { route: 'attivita', bg: 'linear-gradient(165deg,#DCFCE7,#DBEAFE)', title: 'Allenamenti e\nattività, sempre.' },
  { route: 'diario', bg: 'linear-gradient(165deg,#F3E8FF,#FAE8FF)', title: 'Diario e umore,\nogni giorno.' },
  { route: 'peso', bg: 'linear-gradient(165deg,#E0F2FE,#EDE9FE)', title: 'Monitora il peso\ne i progressi.' },
];

function slideHTML(bg, title, dataUri) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:428px;height:926px;overflow:hidden}
  .wrap{width:428px;height:926px;background:${bg};display:flex;flex-direction:column;align-items:center;
    font-family:Inter,'Helvetica Neue',Helvetica,'Liberation Sans',Arial,sans-serif}
  .title{width:344px;margin-top:60px;font-size:36px;line-height:1.08;font-weight:800;color:#0b0b0f;
    letter-spacing:-.02em;white-space:pre-line}
  .phone{margin-top:36px;width:322px;aspect-ratio:390/844;background:#0b0b0f;border-radius:48px;padding:11px;
    box-shadow:0 28px 60px rgba(20,20,40,.22);position:relative}
  .screen{width:100%;height:100%;border-radius:38px;overflow:hidden;background:#fff}
  .screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
  .island{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:96px;height:28px;background:#0b0b0f;border-radius:16px;z-index:2}
  </style></head><body><div class="wrap">
    <div class="title">${title}</div>
    <div class="phone"><div class="island"></div><div class="screen"><img src="${dataUri}"></div></div>
  </div></body></html>`;
}

async function seed(page) {
  await page.evaluate(async () => {
    const iso = (d) => d.toISOString().slice(0, 10);
    const today = new Date();
    const day = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
    const T = Date.now();

    const open = () => new Promise((res, rej) => { const r = indexedDB.open('vita'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const db = await open();
    const put = (store, rows) => new Promise((res, rej) => {
      const tx = db.transaction(store, 'readwrite');
      rows.forEach((row) => tx.objectStore(store).put(row));
      tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error);
    });

    // settings: set a name
    await new Promise((res) => {
      const tx = db.transaction('settings', 'readwrite');
      const st = tx.objectStore('settings');
      const g = st.get('app');
      g.onsuccess = () => { const s = g.result; if (s) { s.name = 'Samuele'; st.put(s); } };
      tx.oncomplete = () => res();
    });

    const habits = [
      { id: 'h1', name: 'Idratazione', color: '#0EA5E9', icon: 'Droplet', frequency: { type: 'daily' }, archived: false, order: 1, createdAt: T, updatedAt: T },
      { id: 'h2', name: 'Palestra', color: '#10B981', icon: 'Dumbbell', frequency: { type: 'times_per_week', timesPerWeek: 3 }, archived: false, order: 2, createdAt: T, updatedAt: T },
      { id: 'h3', name: 'Lettura', color: '#F59E0B', icon: 'BookOpen', frequency: { type: 'daily' }, archived: false, order: 3, createdAt: T, updatedAt: T },
      { id: 'h4', name: 'Meditazione', color: '#7C3AED', icon: 'Brain', frequency: { type: 'daily' }, archived: false, order: 4, createdAt: T, updatedAt: T },
      { id: 'h5', name: 'Camminata', color: '#FF6B57', icon: 'Footprints', frequency: { type: 'daily' }, archived: false, order: 5, createdAt: T, updatedAt: T },
    ];
    await put('habits', habits);

    const logs = [];
    for (const h of habits) {
      for (let n = 0; n < 16; n++) {
        if ((n + Number(h.id.slice(1))) % 7 === 3) continue; // skip a few for realism
        const date = iso(day(n));
        logs.push({ id: `${h.id}:${date}`, habitId: h.id, date, done: true, createdAt: T });
      }
    }
    await put('habitLogs', logs);

    await put('waterLogs', [{ id: iso(today), date: iso(today), ml: 1500, updatedAt: T }]);

    const weights = [];
    let w = 78.6;
    for (let n = 21; n >= 0; n -= 3) { weights.push({ id: `wt${n}`, date: iso(day(n)), weightKg: Math.round(w * 10) / 10, createdAt: T, updatedAt: T }); w -= 0.2; }
    await put('weightLogs', weights);

    const workouts = [
      { id: 'wk1', sportId: 'run_outdoor', startedAt: day(1).getTime(), durationSec: 1860, activeKcal: 322, distanceM: 5200, avgHr: 151, maxHr: 168, source: 'manual', createdAt: T, updatedAt: T },
      { id: 'wk2', sportId: 'run_outdoor', startedAt: day(4).getTime(), durationSec: 2400, activeKcal: 410, distanceM: 6800, avgHr: 148, maxHr: 170, source: 'manual', createdAt: T, updatedAt: T },
      { id: 'wk3', sportId: 'bike_outdoor', startedAt: day(6).getTime(), durationSec: 3000, activeKcal: 380, distanceM: 14500, avgHr: 139, maxHr: 159, source: 'manual', createdAt: T, updatedAt: T },
    ];
    await put('workouts', workouts);

    await put('journalEntries', [
      { id: 'j1', date: iso(today), mood: 4, text: 'Giornata produttiva: corsa al mattino e tanto focus sul progetto.', tags: ['sport', 'lavoro'], createdAt: T, updatedAt: T },
      { id: 'j2', date: iso(day(1)), mood: 5, text: 'Serata di relax e lettura. Mi sento in equilibrio.', tags: ['relax'], createdAt: T, updatedAt: T },
    ]);

    await put('tasks', [
      { id: 't1', title: 'Allenamento gambe', status: 'done', priority: 'medium', subtasks: [], order: 1, dueDate: iso(today), completedAt: T, createdAt: T, updatedAt: T },
      { id: 't2', title: 'Leggere 20 pagine', status: 'todo', priority: 'low', subtasks: [], order: 2, dueDate: iso(today), createdAt: T, updatedAt: T },
      { id: 't3', title: 'Pianificare la settimana', status: 'todo', priority: 'high', subtasks: [], order: 3, dueDate: iso(today), createdAt: T, updatedAt: T },
    ]);

    db.close();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const server = await serve(DIST);
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('vita.onboarded', '1');
    localStorage.setItem('vita.lang', 'it');
  });

  // First load → app creates the Dexie DB, then we seed and reload so the
  // liveQueries pick up the sample data.
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`${base}/#/oggi`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await seed(page);
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(1200);
  // Kill animations/transitions so screenshots settle instantly and don't keep
  // the compositor busy (the activity rings/mascot animate continuously).
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;}' });
  // Simulate the iOS safe-area (so the app header drops below the notch) and
  // paint a realistic status bar (time + cellular/wifi/battery) into the page,
  // so the captured screen looks like a real device.
  await page.addStyleTag({ content: '.pt-safe-top{padding-top:47px!important}' });
  await page.addStyleTag({ content: '.pb-safe-bottom{padding-bottom:22px!important}' });
  await page.evaluate(() => {
    if (document.getElementById('ios-sb')) return;
    const el = document.createElement('div');
    el.id = 'ios-sb';
    el.innerHTML =
      '<span style="font:600 15px -apple-system,Helvetica,Arial,sans-serif">9:41</span>' +
      '<span style="display:flex;align-items:center;gap:7px">' +
      '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
      '<svg width="17" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.5 0 4.8 1 6.5 2.6l-1.4 1.5C11.8 5 10 4.2 8 4.2 6 4.2 4.2 5 2.9 6.3L1.5 4.8C3.2 3.2 5.5 2.2 8 2.2z"/><path d="M8 6c1.4 0 2.7.5 3.7 1.5l-1.5 1.5C9.6 8.4 8.8 8 8 8c-.8 0-1.6.4-2.2 1L4.3 7.5C5.3 6.5 6.6 6 8 6z"/><circle cx="8" cy="10.6" r="1.3"/></svg>' +
      '<svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-opacity="0.4"/><rect x="2" y="2" width="19" height="9" rx="1.5" fill="currentColor"/><rect x="24" y="4.5" width="2" height="4" rx="1" fill="currentColor" fill-opacity="0.5"/></svg>' +
      '</span>';
    el.style.cssText =
      'position:fixed;top:0;left:0;right:0;height:47px;display:flex;align-items:center;justify-content:space-between;padding:0 22px 0 30px;z-index:99999;color:#0b0b0f;pointer-events:none';
    document.body.appendChild(el);
    // Home indicator bar at the very bottom.
    const hi = document.createElement('div');
    hi.id = 'ios-home';
    hi.style.cssText =
      'position:fixed;bottom:8px;left:50%;transform:translateX(-50%);width:140px;height:5px;border-radius:3px;background:#0b0b0f;z-index:99999;pointer-events:none';
    document.body.appendChild(hi);
  });
  await sleep(200);

  // Separate tab for composing the marketing slides (setContent replaces the
  // document, so we keep the live app in its own page).
  const slidePage = await browser.newPage();

  const KILL_ANIM = '*,*::before,*::after{animation:none!important;transition:none!important;}';
  const shoot = async (p, opts) => {
    for (let i = 0; i < 3; i++) {
      try { return await p.screenshot(opts); } catch (e) { if (i === 2) throw e; await sleep(800); }
    }
  };

  for (const s of SLIDES) {
    try {
      // Navigate within the SPA via the hash (no full reload needed).
      await page.evaluate((r) => { window.location.hash = `#/${r}`; }, s.route);
      await sleep(1800);
      await page.addStyleTag({ content: KILL_ANIM }).catch(() => {});
      await sleep(300);
      const shot = await shoot(page, { type: 'png', encoding: 'base64' });
      const dataUri = `data:image/png;base64,${shot}`;

      await slidePage.setViewport({ width: 428, height: 926, deviceScaleFactor: 3 });
      await slidePage.setContent(slideHTML(s.bg, s.title, dataUri), { waitUntil: 'load', timeout: 60000 });
      await sleep(300);
      const file = path.join(OUT, `${s.route}.png`);
      await shoot(slidePage, { path: file, type: 'png' });
      console.log('saved', file);
    } catch (e) {
      console.log('FAILED', s.route, e.message);
    }
  }

  await browser.close();
  server.close();
})();
