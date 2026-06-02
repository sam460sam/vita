// Builds Vita app/PWA icons from the user's logo (public/app-icon-clean.png):
// crops the green logo, scales it to ~72% of the tile, centers it on a solid
// white square, and writes all icon sizes + splash. Apple wants a full square,
// no rounded corners, no alpha — this produces exactly that.
import zlib from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = resolve(__dirname, '../public');
const ASSETS = resolve(__dirname, '../assets');
mkdirSync(resolve(PUB, 'icons'), { recursive: true });
mkdirSync(ASSETS, { recursive: true });

function decodePNG(buf) {
  let p = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p); p += 4; const type = buf.toString('ascii', p, p + 4); p += 4;
    const data = buf.subarray(p, p + len); p += len; p += 4;
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ct === 6 ? 4 : 3, stride = w * ch, out = Buffer.alloc(w * h * 4), prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  const pa = (a, b, c) => { const p2 = a + b - c, x = Math.abs(p2 - a), y = Math.abs(p2 - b), z = Math.abs(p2 - c); return x <= y && x <= z ? a : y <= z ? b : c; };
  let pos = 0;
  for (let yy = 0; yy < h; yy++) {
    const f = raw[pos++];
    for (let i = 0; i < stride; i++) { const xb = raw[pos++], a = i >= ch ? cur[i - ch] : 0, b = prev[i], c = i >= ch ? prev[i - ch] : 0; let v; if (f === 0) v = xb; else if (f === 1) v = xb + a; else if (f === 2) v = xb + b; else if (f === 3) v = xb + ((a + b) >> 1); else v = xb + pa(a, b, c); cur[i] = v & 255; }
    for (let x = 0; x < w; x++) { const o = (yy * w + x) * 4; out[o] = cur[x * ch]; out[o + 1] = cur[x * ch + 1]; out[o + 2] = cur[x * ch + 2]; out[o + 3] = ch === 4 ? cur[x * ch + 3] : 255; }
    cur.copy(prev);
  }
  return { w, h, rgba: out };
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1)); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length, 0); const body = Buffer.concat([Buffer.from(t, 'ascii'), d]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0, 0); return Buffer.concat([l, body, crc]); };
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return c ^ 0xffffffff; }

const src = decodePNG(readFileSync(resolve(PUB, 'app-icon-clean.png')));

// bounding box of green (non-white) pixels
let minX = src.w, minY = src.h, maxX = 0, maxY = 0;
for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
  const o = (y * src.w + x) * 4;
  if (!(src.rgba[o] > 240 && src.rgba[o + 1] > 240 && src.rgba[o + 2] > 240)) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
}
const lw = maxX - minX + 1, lh = maxY - minY + 1;

// Render: scale logo so its WIDTH = fill * size, centered, on white bg.
function renderIcon(size, { bg = [255, 255, 255], fill = 0.74, alpha = false } = {}) {
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) { out[i * 4] = bg[0]; out[i * 4 + 1] = bg[1]; out[i * 4 + 2] = bg[2]; out[i * 4 + 3] = alpha ? 0 : 255; }
  const target = size * fill;
  const scale = target / lw;
  const dw = Math.round(lw * scale), dh = Math.round(lh * scale);
  const ox = Math.round((size - dw) / 2), oy = Math.round((size - dh) / 2);
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const sx = minX + Math.floor(x / scale), sy = minY + Math.floor(y / scale);
    const so = (sy * src.w + sx) * 4;
    const r = src.rgba[so], g = src.rgba[so + 1], b = src.rgba[so + 2];
    const white = r > 240 && g > 240 && b > 240;
    const d = ((oy + y) * size + (ox + x)) * 4;
    if (!white) { out[d] = r; out[d + 1] = g; out[d + 2] = b; out[d + 3] = 255; }
    else if (alpha) { /* leave transparent */ }
    else { out[d] = bg[0]; out[d + 1] = bg[1]; out[d + 2] = bg[2]; out[d + 3] = 255; }
  }
  return encodePNG(size, size, out);
}

writeFileSync(resolve(ASSETS, 'icon.png'), renderIcon(1024, { fill: 0.74 }));
writeFileSync(resolve(PUB, 'icons/icon-512.png'), renderIcon(512, { fill: 0.74 }));
writeFileSync(resolve(PUB, 'icons/icon-192.png'), renderIcon(192, { fill: 0.74 }));
writeFileSync(resolve(PUB, 'icons/icon-512-maskable.png'), renderIcon(512, { fill: 0.6 }));
writeFileSync(resolve(PUB, 'apple-touch-icon.png'), renderIcon(180, { fill: 0.74 }));
writeFileSync(resolve(ASSETS, 'splash.png'), renderIcon(2732, { fill: 0.32 }));
writeFileSync(resolve(ASSETS, 'splash-dark.png'), renderIcon(2732, { fill: 0.32, bg: [10, 10, 12] }));
console.log('Vita icons generated from user logo. logo box', lw, 'x', lh);
