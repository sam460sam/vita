// Intro / "cover" slide for the App Store (no device mockup): a headline plus a
// list of the app's capabilities with icons. Rendered at 1284x2778 (6.5") for
// both languages. Output: out/00-intro.png (it) and out/en/00-intro.png.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ICONS = {
  flame: '<path d="M12 2c1.2 3.8-2.6 5.1-2.6 8.6a2.6 2.6 0 0 0 5.2 0c0-.9-.4-1.6-.4-2.4 1.7.9 3.2 2.8 3.2 5.2a5.4 5.4 0 0 1-10.8 0C6.6 8.4 10.6 6.4 12 2z" fill="currentColor"/>',
  activity: '<polyline points="3,12 8,12 11,4 14,20 17,12 21,12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  droplet: '<path d="M12 2.5S5 9.8 5 14.8a7 7 0 0 0 14 0C19 9.8 12 2.5 12 2.5z" fill="currentColor"/>',
  heart: '<path d="M12 20.5S4.5 15.6 4.5 10.4A3.9 3.9 0 0 1 12 8.2a3.9 3.9 0 0 1 7.5 2.2c0 5.2-7.5 10.1-7.5 10.1z" fill="currentColor"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 12.5h2.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M3 9h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  target: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
};

const FEATURES = [
  { color: '#FF6B57', icon: 'flame', it: 'Abitudini e streak', en: 'Habits & streaks' },
  { color: '#FF2D55', icon: 'activity', it: 'Attività e allenamenti', en: 'Activity & workouts' },
  { color: '#0EA5E9', icon: 'droplet', it: 'Acqua e benessere', en: 'Water & wellness' },
  { color: '#7C3AED', icon: 'heart', it: 'Diario e umore', en: 'Journal & mood' },
  { color: '#10B981', icon: 'wallet', it: 'Finanze e budget', en: 'Finances & budget' },
  { color: '#2563EB', icon: 'target', it: 'Obiettivi e progetti', en: 'Goals & projects' },
];

const TEXT = {
  it: { title: 'Tutta la tua vita,\nin un posto.', footer: 'Privato e offline. Sempre con te.' },
  en: { title: 'Your whole life,\nin one place.', footer: 'Private and offline. Always with you.' },
};

function introHTML(lang) {
  const t = TEXT[lang];
  const rows = FEATURES.map((f) => `
    <div class="row">
      <span class="chip" style="background:${f.color}1a;color:${f.color}">
        <svg width="26" height="26" viewBox="0 0 24 24">${ICONS[f.icon]}</svg>
      </span>
      <span class="label">${f[lang]}</span>
    </div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:428px;height:926px;overflow:hidden}
    .wrap{width:428px;height:926px;background:linear-gradient(165deg,#EEF2FF,#FCE7F3);
      font-family:Inter,'Helvetica Neue',Helvetica,'Liberation Sans',Arial,sans-serif;
      display:flex;flex-direction:column;padding:84px 46px 56px}
    .brand{display:flex;align-items:center;gap:12px;margin-bottom:30px}
    .logo{width:54px;height:54px;border-radius:14px;background:#fff;box-shadow:0 6px 18px rgba(20,20,50,.12);
      display:flex;align-items:center;justify-content:center}
    .brand-name{font-size:26px;font-weight:800;color:#0b0b0f;letter-spacing:-.02em}
    .title{font-size:40px;line-height:1.06;font-weight:800;color:#0b0b0f;letter-spacing:-.025em;white-space:pre-line;margin-bottom:34px}
    .row{display:flex;align-items:center;gap:16px;margin-bottom:18px}
    .chip{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .label{font-size:22px;font-weight:600;color:#1c1c22}
    .footer{margin-top:auto;font-size:17px;font-weight:600;color:#6b6b76;text-align:center}
  </style></head><body><div class="wrap">
    <div class="brand">
      <span class="logo"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 7-10 0 0-2 4-1 7"/><path d="M11 20c0-6 3-11 9-13 0 5-3 13-9 13z"/></svg></span>
      <span class="brand-name">Vyta</span>
    </div>
    <div class="title">${t.title}</div>
    ${rows}
    <div class="footer">${t.footer}</div>
  </div></body></html>`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 428, height: 926, deviceScaleFactor: 3 });
  for (const [lang, out] of [['it', path.join(__dirname, 'out', '00-intro.png')], ['en', path.join(__dirname, 'out', 'en', '00-intro.png')]]) {
    await page.setContent(introHTML(lang), { waitUntil: 'load', timeout: 60000 });
    await sleep(300);
    await page.screenshot({ path: out, type: 'png' });
    console.log('saved', out);
  }
  await browser.close();
})();
