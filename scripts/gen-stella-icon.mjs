// Renders the Stella mascot SVG to crisp PNGs (incl. a 4K master) via headless
// Chromium, so gradients/highlights are real. Outputs app/PWA icons, splash
// sources and a 4096px master. Run: node scripts/gen-stella-icon.mjs
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Inlined copy of src/ui/starPath.ts (Node can't import .ts directly).
function roundedStarPath(cx, cy, outer, inner, points = 5, round = 0.32, rotation = -Math.PI / 2) {
  const verts = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + i * step;
    verts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  const n = verts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const cur = verts[i];
    const next = verts[(i + 1) % n];
    const a = { x: cur.x + (prev.x - cur.x) * round, y: cur.y + (prev.y - cur.y) * round };
    const bb = { x: cur.x + (next.x - cur.x) * round, y: cur.y + (next.y - cur.y) * round };
    d += (i === 0 ? `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} ` : `L ${a.x.toFixed(2)} ${a.y.toFixed(2)} `);
    d += `Q ${cur.x.toFixed(2)} ${cur.y.toFixed(2)} ${bb.x.toFixed(2)} ${bb.y.toFixed(2)} `;
  }
  return d + 'Z';
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');
const ASSETS = resolve(__dirname, '../assets');
mkdirSync(resolve(PUBLIC, 'icons'), { recursive: true });
mkdirSync(ASSETS, { recursive: true });

const body = roundedStarPath(100, 100, 80, 41, 5, 0.34);

// Stella, centered, optional padding scale + background.
function svg({ bg = '#ffffff', pad = 1 }) {
  const t = (1 - pad) * 100; // translate to keep centered when scaling down
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <radialGradient id="body" cx="42%" cy="34%" r="78%">
      <stop offset="0%" stop-color="#FFE08A"/><stop offset="48%" stop-color="#FFD23F"/><stop offset="100%" stop-color="#F7B500"/>
    </radialGradient>
    <radialGradient id="gloss" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.85"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="eye" cx="38%" cy="32%" r="75%">
      <stop offset="0%" stop-color="#3A3A52"/><stop offset="100%" stop-color="#15152A"/>
    </radialGradient>
  </defs>
  ${bg === 'transparent' ? '' : `<rect width="200" height="200" fill="${bg}"/>`}
  <g transform="translate(${t} ${t}) scale(${pad})">
    <g transform="rotate(-6 100 100)">
      <path d="${body}" fill="url(#body)"/>
      <ellipse cx="78" cy="66" rx="48" ry="36" fill="url(#gloss)" opacity="0.7"/>
    </g>
    <ellipse cx="68" cy="114" rx="11" ry="7" fill="#FF8FA3" opacity="0.55"/>
    <ellipse cx="128" cy="110" rx="11" ry="7" fill="#FF8FA3" opacity="0.55"/>
    <ellipse cx="82" cy="98" rx="11" ry="12.5" fill="url(#eye)"/>
    <ellipse cx="118" cy="98" rx="11" ry="12.5" fill="url(#eye)"/>
    <circle cx="78.5" cy="93" r="3.6" fill="#fff"/><circle cx="114.5" cy="93" r="3.6" fill="#fff"/>
    <circle cx="85" cy="101.5" r="1.7" fill="#fff" opacity="0.8"/><circle cx="121" cy="101.5" r="1.7" fill="#fff" opacity="0.8"/>
    <path d="M92 118 Q100 126 108 118" stroke="#C2410C" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="0.55"/>
  </g>
</svg>`;
}

async function render(page, markup, size, out) {
  const html = `<!doctype html><html><head><meta charset=utf8><style>*{margin:0}html,body{width:${size}px;height:${size}px}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${markup}</body></html>`;
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  const el = await page.$('svg');
  await el.screenshot({ path: out, omitBackground: markup.includes('rect') ? false : true });
  console.log('→', out.split('/').slice(-1)[0], `${size}px`);
}

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage();

const white = svg({ bg: '#ffffff' });
const maskable = svg({ bg: '#ffffff', pad: 0.72 });
const dark = svg({ bg: '#0a0a0c', pad: 0.18 });
const lightSplash = svg({ bg: '#ffffff', pad: 0.18 });

// 4K master + app/PWA icons (white bg, full-bleed Stella)
await render(page, white, 4096, resolve(ASSETS, 'stella-4k.png'));
await render(page, white, 1024, resolve(ASSETS, 'icon.png'));
await render(page, white, 512, resolve(PUBLIC, 'icons/icon-512.png'));
await render(page, white, 192, resolve(PUBLIC, 'icons/icon-192.png'));
await render(page, maskable, 512, resolve(PUBLIC, 'icons/icon-512-maskable.png'));
await render(page, white, 180, resolve(PUBLIC, 'apple-touch-icon.png'));
// Splash sources (small centered Stella on big canvas)
await render(page, lightSplash, 2732, resolve(ASSETS, 'splash.png'));
await render(page, dark, 2732, resolve(ASSETS, 'splash-dark.png'));

await b.close();
console.log('Stella icons rendered.');
