// Vita app icon: rounded green "Vita" wordmark with a two-leaf sprout growing
// above the "V" (top-left), matching the reference. Headless Chromium → PNGs.
// Rounded look achieved by stroking the glyphs with stroke-linejoin:round.
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');
const ASSETS = resolve(__dirname, '../assets');
mkdirSync(resolve(PUBLIC, 'icons'), { recursive: true });
mkdirSync(ASSETS, { recursive: true });

const GREEN = '#34C734';

// Seedling: a small left leaf + a bigger right leaf joined by a short stem that
// dips down toward the V. Centered at (cx, cy), scale s.
function sprout(cx, cy, s) {
  const T = (x, y) => `${(cx + x * s).toFixed(2)} ${(cy + y * s).toFixed(2)}`;
  return `<g fill="${GREEN}" stroke="${GREEN}" stroke-width="${2 * s}" stroke-linejoin="round">
    <!-- stem dipping toward the V -->
    <path d="M${T(2, 14)} C ${T(0, 4)} ${T(-2, 0)} ${T(-2, -4)}" fill="none" stroke-width="${5 * s}" stroke-linecap="round"/>
    <!-- left small leaf -->
    <path d="M${T(-3, 2)} C ${T(-24, 4)} ${T(-30, -12)} ${T(-18, -22)} C ${T(-7, -14)} ${T(-3, -5)} ${T(-3, 2)} Z"/>
    <!-- right bigger leaf -->
    <path d="M${T(-1, 0)} C ${T(20, -2)} ${T(28, -20)} ${T(16, -34)} C ${T(2, -22)} ${T(-3, -8)} ${T(-1, 0)} Z"/>
  </g>`;
}

function svg({ bg = '#ffffff', pad = 1, fs = 108 }) {
  const tr = (1 - pad) * 100;
  const baseY = 130;
  // Sprout sits above the V (left side of the centered word).
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  ${bg === 'transparent' ? '' : `<rect width="200" height="200" rx="44" fill="${bg}"/>`}
  <g transform="translate(${tr} ${tr}) scale(${pad})">
    <text x="102" y="${baseY}"
      font-family="'Varela Round','Quicksand','Baloo 2','Arial Rounded MT Bold','Trebuchet MS',sans-serif"
      font-weight="700" font-size="${fs}" fill="${GREEN}" stroke="${GREEN}"
      stroke-width="9" stroke-linejoin="round" paint-order="stroke"
      text-anchor="middle" letter-spacing="-1">Vita</text>
    ${sprout(70, 60, 1.15)}
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
console.log('Vita rounded sprout icons rendered.');
