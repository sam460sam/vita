// Regenerate ALL Vita app icons from the user's logo (public/IMG_7372.jpg).
// Uses headless Chromium (puppeteer) for high-quality scaling. Normalises the
// off-white photo background to pure white, trims to the logo, and centers it
// on a solid square (Apple wants a full square, no alpha, no rounded corners).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = resolve(__dirname, '../public');
const ASSETS = resolve(__dirname, '../assets');
mkdirSync(resolve(PUB, 'icons'), { recursive: true });
mkdirSync(ASSETS, { recursive: true });

const SRC = resolve(PUB, 'IMG_7372.jpg');
const dataUrl = 'data:image/jpeg;base64,' + readFileSync(SRC).toString('base64');

const WHITE = [255, 255, 255];
const DARK = [10, 10, 12];

// Each output: { path, size, fill, bg, dark, transparent }
//  - fill: logo size as fraction of canvas (0 = background only, no logo)
//  - dark/transparent: render the logo with smooth alpha edges (no white halo)
const OUTPUTS = [
  // Web / PWA
  { path: resolve(PUB, 'app-icon-clean.png'), size: 1024, fill: 0.9, bg: WHITE },
  { path: resolve(ASSETS, 'icon.png'), size: 1024, fill: 0.74, bg: WHITE },
  { path: resolve(PUB, 'icons/icon-512.png'), size: 512, fill: 0.74, bg: WHITE },
  { path: resolve(PUB, 'icons/icon-192.png'), size: 192, fill: 0.74, bg: WHITE },
  { path: resolve(PUB, 'icons/icon-512-maskable.png'), size: 512, fill: 0.6, bg: WHITE },
  { path: resolve(PUB, 'apple-touch-icon.png'), size: 180, fill: 0.74, bg: WHITE },
  { path: resolve(PUB, 'favicon-192.png'), size: 192, fill: 0.74, bg: WHITE },
  { path: resolve(ASSETS, 'splash.png'), size: 2732, fill: 0.3, bg: WHITE },
  { path: resolve(ASSETS, 'splash-dark.png'), size: 2732, fill: 0.3, bg: DARK, dark: true },
  // iOS — single 1024 app icon
  { path: resolve(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'), size: 1024, fill: 0.74, bg: WHITE },
];

// Android — legacy launcher (white bg) + adaptive foreground (transparent) /
// background (solid white) per density.
const AND = resolve(__dirname, '../android/app/src/main/res');
const DENSITIES = [
  ['ldpi', 36, 81], ['mdpi', 48, 108], ['hdpi', 72, 162],
  ['xhdpi', 96, 216], ['xxhdpi', 144, 324], ['xxxhdpi', 192, 486],
];
for (const [d, launcher, adaptive] of DENSITIES) {
  const dir = `${AND}/mipmap-${d}`;
  OUTPUTS.push({ path: `${dir}/ic_launcher.png`, size: launcher, fill: 0.74, bg: WHITE });
  OUTPUTS.push({ path: `${dir}/ic_launcher_round.png`, size: launcher, fill: 0.74, bg: WHITE });
  OUTPUTS.push({ path: `${dir}/ic_launcher_foreground.png`, size: adaptive, fill: 0.5, transparent: true });
  OUTPUTS.push({ path: `${dir}/ic_launcher_background.png`, size: adaptive, fill: 0, bg: WHITE });
}

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 64, height: 64 });

const results = await page.evaluate(async (dataUrl, outputs) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });

  // Draw source to a canvas, read pixels.
  const sc = document.createElement('canvas');
  sc.width = img.naturalWidth; sc.height = img.naturalHeight;
  const sx = sc.getContext('2d');
  sx.drawImage(img, 0, 0);
  const id = sx.getImageData(0, 0, sc.width, sc.height);
  const d = id.data;
  const W = sc.width, H = sc.height;

  const isBg = (r, g, b) => r > 225 && g > 225 && b > 225;

  // Bounding box of the logo (non-white pixels).
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4;
    if (!isBg(d[o], d[o + 1], d[o + 2])) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const lw = maxX - minX + 1, lh = maxY - minY + 1;

  // Build two cleaned versions of the cropped logo:
  //  - light: near-white snapped to pure white (removes off-white tint)
  //  - alpha: near-white -> transparent with smooth edge alpha (for dark bg)
  function cropped(alpha) {
    const c = document.createElement('canvas');
    c.width = lw; c.height = lh;
    const cx = c.getContext('2d');
    const out = cx.createImageData(lw, lh);
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
      const so = ((minY + y) * W + (minX + x)) * 4;
      const r = d[so], g = d[so + 1], b = d[so + 2];
      const o = (y * lw + x) * 4;
      const w = Math.min(r, g, b);
      if (alpha) {
        out.data[o] = r; out.data[o + 1] = g; out.data[o + 2] = b;
        out.data[o + 3] = w >= 232 ? 0 : Math.max(0, Math.min(255, ((232 - w) / 24) * 255));
      } else {
        const white = isBg(r, g, b);
        out.data[o] = white ? 255 : r;
        out.data[o + 1] = white ? 255 : g;
        out.data[o + 2] = white ? 255 : b;
        out.data[o + 3] = 255;
      }
    }
    cx.putImageData(out, 0, 0);
    return c;
  }
  const lightLogo = cropped(false);
  const alphaLogo = cropped(true);

  const out = {};
  for (const spec of outputs) {
    const { path, size, fill, bg, dark, transparent } = spec;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const cx = c.getContext('2d');
    if (!transparent) {
      cx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
      cx.fillRect(0, 0, size, size);
    }
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    if (fill > 0) {
      const box = size * fill;
      const scale = box / Math.max(lw, lh);
      const dw = lw * scale, dh = lh * scale;
      cx.drawImage(dark || transparent ? alphaLogo : lightLogo, (size - dw) / 2, (size - dh) / 2, dw, dh);
    }
    out[path] = c.toDataURL('image/png').split(',')[1];
  }
  return { out, lw, lh };
}, dataUrl, OUTPUTS);

for (const { path } of OUTPUTS) {
  writeFileSync(path, Buffer.from(results.out[path], 'base64'));
}
await browser.close();
console.log('Icons regenerated from IMG_7372.jpg · logo box', results.lw, 'x', results.lh);
