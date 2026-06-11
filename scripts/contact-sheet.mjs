// Assemble all captured screens into one contact sheet per theme.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, '../store/candy');

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

async function sheet(theme, bg) {
  const files = readdirSync(DIR).filter((f) => f.startsWith(`${theme}-`) && f.endsWith('.png')).sort();
  const cards = files
    .map((f) => {
      const b64 = readFileSync(resolve(DIR, f)).toString('base64');
      const label = f.replace(`${theme}-`, '').replace('.png', '').replace(/^\d+-/, '');
      return `<figure><img src="data:image/png;base64,${b64}"/><figcaption>${label}</figcaption></figure>`;
    })
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;box-sizing:border-box}
    body{background:${bg};font-family:-apple-system,system-ui,sans-serif;padding:28px}
    .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
    figure{display:flex;flex-direction:column;align-items:center;gap:8px}
    img{width:100%;border-radius:18px;box-shadow:0 8px 28px rgba(0,0,0,.18)}
    figcaption{font-size:18px;font-weight:600;color:${theme === 'dark' ? '#e8e8ec' : '#1a1a1a'};text-transform:capitalize}
  </style></head><body><div class="grid">${cards}</div></body></html>`;

  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: 1000, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const out = resolve(DIR, `_sheet-${theme}.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log('sheet →', out);
  await page.close();
}

await sheet('light', '#f7f3ea');
await sheet('dark', '#0a0a0c');
await browser.close();
