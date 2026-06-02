// Vita app icon: green "Vita" wordmark where the dot of the "i" is replaced by
// a two-leaf sprout. Headless Chromium → crisp PNGs.
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');
const ASSETS = resolve(__dirname, '../assets');
mkdirSync(resolve(PUBLIC, 'icons'), { recursive: true });
mkdirSync(ASSETS, { recursive: true });

const GREEN = '#3DBB3D';

// Two-leaf sprout centered at (cx, cy) — small, to sit as the dot of the "i".
function sprout(cx, cy, s) {
  const T = (x, y) => `${(cx + x * s).toFixed(2)} ${(cy + y * s).toFixed(2)}`;
  return `<g fill="${GREEN}">
    <path d="M${T(0, 8)} C ${T(-20, 8)} ${T(-26, -8)} ${T(-16, -18)} C ${T(-5, -11)} ${T(-1, -1)} ${T(0, 8)} Z"/>
    <path d="M${T(0, 8)} C ${T(22, 4)} ${T(25, -16)} ${T(12, -26)} C ${T(1, -14)} ${T(-1, -3)} ${T(0, 8)} Z"/>
  </g>`;
}

// Renders "Vita" then overlays the sprout where the i-dot would be.
// We draw the word, hide the native i-dot by using a glyph trick: write
// "V​ı​ta" is unreliable across renderers, so instead we place the wordmark and
// cover/replace the dot region with the sprout precisely.
function svg({ bg = '#ffffff', pad = 1, fs = 110 }) {
  const tr = (1 - pad) * 100;
  const baseY = 128;
  // measured offsets for Inter/Arial bold at this size & anchor=middle "Vita":
  // the "i" dot sits a bit right of centre. Tune with iDotX/iDotY.
  const iDotX = 108;
  const iDotY = 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  ${bg === 'transparent' ? '' : `<rect width="200" height="200" rx="44" fill="${bg}"/>`}
  <g transform="translate(${tr} ${tr}) scale(${pad})">
    <text x="100" y="${baseY}" font-family="Inter, Arial, sans-serif" font-weight="800"
      font-size="${fs}" fill="${GREEN}" text-anchor="middle" letter-spacing="-3">Vıta</text>
    ${sprout(iDotX, iDotY, 1.05)}
  </g>
</svg>`;
}

async function render(page, markup, size, out) {
  const html = `<!doctype html><html><head><meta charset=utf8><style>*{margin:0}html,body{width:${size}px;height:${size}px}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${markup}</body></html>`;
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  const el = await page.$('svg');
  await el.screenshot({ path: out });
  console.log('→', out.split('/').slice(-1)[0], `${size}px`);
}

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage();

const white = svg({ bg: '#ffffff' });
const maskable = svg({ bg: '#ffffff', pad: 0.84 });
const dark = svg({ bg: '#0a0a0c', pad: 0.5, fs: 110 });
const lightSplash = svg({ bg: '#ffffff', pad: 0.5 });

await render(page, white, 4096, resolve(ASSETS, 'vita-4k.png'));
await render(page, white, 1024, resolve(ASSETS, 'icon.png'));
await render(page, white, 512, resolve(PUBLIC, 'icons/icon-512.png'));
await render(page, white, 192, resolve(PUBLIC, 'icons/icon-192.png'));
await render(page, maskable, 512, resolve(PUBLIC, 'icons/icon-512-maskable.png'));
await render(page, white, 180, resolve(PUBLIC, 'apple-touch-icon.png'));
await render(page, lightSplash, 2732, resolve(ASSETS, 'splash.png'));
await render(page, dark, 2732, resolve(ASSETS, 'splash-dark.png'));

await b.close();
console.log('Vita i-dot sprout icons rendered.');
