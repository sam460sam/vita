// Renders the Vita app icon: "VITA" as a brown tree-trunk rising upward with a
// koala climbing it. Headless Chromium → crisp PNGs (4K master + all sizes).
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');
const ASSETS = resolve(__dirname, '../assets');
mkdirSync(resolve(PUBLIC, 'icons'), { recursive: true });
mkdirSync(ASSETS, { recursive: true });

// Koala head (compact, centered at given cx,cy with scale s)
function koala(cx, cy, s) {
  const t = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `
  <g>
    <circle cx="${cx - 34 * s}" cy="${cy - 30 * s}" r="${26 * s}" fill="#AEB6BF"/>
    <circle cx="${cx + 34 * s}" cy="${cy - 30 * s}" r="${26 * s}" fill="#AEB6BF"/>
    <circle cx="${cx - 34 * s}" cy="${cy - 30 * s}" r="${14 * s}" fill="#F4B8C4"/>
    <circle cx="${cx + 34 * s}" cy="${cy - 30 * s}" r="${14 * s}" fill="#F4B8C4"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${58 * s}" ry="${52 * s}" fill="#B9C0C9"/>
    <ellipse cx="${cx - 52 * s}" cy="${cy + 12 * s}" rx="${13 * s}" ry="${16 * s}" fill="#C7CDD4"/>
    <ellipse cx="${cx + 52 * s}" cy="${cy + 12 * s}" rx="${13 * s}" ry="${16 * s}" fill="#C7CDD4"/>
    <ellipse cx="${cx - 30 * s}" cy="${cy + 18 * s}" rx="${12 * s}" ry="${7 * s}" fill="#FF8FA3" opacity="0.6"/>
    <ellipse cx="${cx + 30 * s}" cy="${cy + 18 * s}" rx="${12 * s}" ry="${7 * s}" fill="#FF8FA3" opacity="0.6"/>
    <circle cx="${cx - 22 * s}" cy="${cy - 6 * s}" r="${8 * s}" fill="#2A2A33"/>
    <circle cx="${cx + 22 * s}" cy="${cy - 6 * s}" r="${8 * s}" fill="#2A2A33"/>
    <circle cx="${cx - 24 * s}" cy="${cy - 9 * s}" r="${2.6 * s}" fill="#fff"/>
    <circle cx="${cx + 20 * s}" cy="${cy - 9 * s}" r="${2.6 * s}" fill="#fff"/>
    <path d="M${t(0, 4)} q${22 * s} ${4 * s} ${22 * s} ${18 * s} q0 ${16 * s} ${-22 * s} ${18 * s} q${-22 * s} ${-2 * s} ${-22 * s} ${-18 * s} q0 ${-14 * s} ${22 * s} ${-18 * s} Z" fill="#3A3A44"/>
    <path d="M${t(-16, 48)} q${16 * s} ${12 * s} ${32 * s} 0" stroke="#3A3A44" stroke-width="${3 * s}" stroke-linecap="round" fill="none" opacity="0.75"/>
  </g>`;
}

function svg({ bg = '#ffffff', pad = 1 }) {
  const tr = (1 - pad) * 100;
  // "VITA" stacked vertically as a tree trunk (brown), rising upward.
  const letters = ['V', 'I', 'T', 'A'];
  const trunk = letters
    .map((ch, i) => `<text x="118" y="${56 + i * 38}" font-family="Inter, Arial, sans-serif" font-weight="900" font-size="42" fill="#8B5A2B" text-anchor="middle">${ch}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  ${bg === 'transparent' ? '' : `<rect width="200" height="200" rx="44" fill="${bg}"/>`}
  <g transform="translate(${tr} ${tr}) scale(${pad})">
    <!-- trunk shadow plank behind letters -->
    <rect x="100" y="24" width="36" height="156" rx="18" fill="#B97A43" opacity="0.18"/>
    ${trunk}
    <!-- koala climbing the trunk, to the left -->
    ${koala(78, 104, 0.62)}
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
const maskable = svg({ bg: '#ffffff', pad: 0.78 });
const dark = svg({ bg: '#0a0a0c', pad: 0.42 });
const lightSplash = svg({ bg: '#ffffff', pad: 0.42 });

await render(page, white, 4096, resolve(ASSETS, 'vita-4k.png'));
await render(page, white, 1024, resolve(ASSETS, 'icon.png'));
await render(page, white, 512, resolve(PUBLIC, 'icons/icon-512.png'));
await render(page, white, 192, resolve(PUBLIC, 'icons/icon-192.png'));
await render(page, maskable, 512, resolve(PUBLIC, 'icons/icon-512-maskable.png'));
await render(page, white, 180, resolve(PUBLIC, 'apple-touch-icon.png'));
await render(page, lightSplash, 2732, resolve(ASSETS, 'splash.png'));
await render(page, dark, 2732, resolve(ASSETS, 'splash-dark.png'));

await b.close();
console.log('Vita koala-tree icons rendered.');
