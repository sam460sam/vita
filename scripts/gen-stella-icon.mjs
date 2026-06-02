// Renders the Vita app icon: green "Vita" wordmark with a sprout/leaf growing
// above the "V". Headless Chromium → crisp PNGs (4K master + all sizes).
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

// Two-leaf sprout centered at (cx, cy), scale s.
function sprout(cx, cy, s) {
  const T = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `<g fill="none" stroke="${GREEN}" stroke-width="${7 * s}" stroke-linecap="round" stroke-linejoin="round">
    <!-- left small leaf -->
    <path d="M${T(0, 6)} C ${T(-22, 6)} ${T(-30, -10)} ${T(-20, -20)} C ${T(-8, -14)} ${T(-2, -2)} ${T(0, 6)} Z" fill="${GREEN}" stroke="none"/>
    <!-- right bigger leaf -->
    <path d="M${T(0, 6)} C ${T(26, 2)} ${T(30, -18)} ${T(16, -30)} C ${T(2, -18)} ${T(-1, -4)} ${T(0, 6)} Z" fill="${GREEN}" stroke="none"/>
    <!-- leaf veins -->
    <path d="M${T(-2, 4)} L ${T(-15, -13)}" stroke-width="${3 * s}"/>
    <path d="M${T(0, 4)} L ${T(12, -22)}" stroke-width="${3 * s}"/>
  </g>`;
}

function svg({ bg = '#ffffff', pad = 1, big = false }) {
  const tr = (1 - pad) * 100;
  // wordmark size: "big" fills more of the tile
  const fs = big ? 96 : 78;
  const baseY = big ? 132 : 120;
  // place sprout above the V (left side of the word)
  const sproutX = big ? 66 : 72;
  const sproutY = big ? 52 : 56;
  const sproutS = big ? 1.25 : 1.0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  ${bg === 'transparent' ? '' : `<rect width="200" height="200" rx="44" fill="${bg}"/>`}
  <g transform="translate(${tr} ${tr}) scale(${pad})">
    <text x="100" y="${baseY}" font-family="Inter, Arial, sans-serif" font-weight="800"
      font-size="${fs}" fill="${GREEN}" text-anchor="middle" letter-spacing="-2">Vita</text>
    ${sprout(sproutX, sproutY, sproutS)}
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

const white = svg({ bg: '#ffffff', big: true });
const maskable = svg({ bg: '#ffffff', pad: 0.82, big: true });
const dark = svg({ bg: '#0a0a0c', pad: 0.5 });
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
console.log('Vita sprout icons rendered.');
