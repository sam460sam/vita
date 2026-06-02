// Prepares the user-provided art:
//  1) APP ICON: crop the white rounded tile out of IMG_7364 and output a full
//     1024 square (Apple wants no rounded corners / no alpha). We sample the
//     logo area and paint it on a solid white square.
//  2) PANDA: make the near-white background of IMG_7365 transparent and trim,
//     so it drops into the app cleanly.
import zlib from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUB = resolve(__dirname, '../public');

// ---- minimal PNG decode (RGB/RGBA, non-interlaced) -> {w,h,rgba} ----
function decodePNG(buf) {
  let p = 8;
  let w = 0, h = 0, ct = 0, bd = 0;
  const idat = [];
  let palette = null;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p); p += 4;
    const type = buf.toString('ascii', p, p + 4); p += 4;
    const data = buf.subarray(p, p + len); p += len; p += 4;
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    else if (type === 'PLTE') palette = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 3 ? 1 : ct === 0 ? 1 : 4;
  const stride = w * ch;
  const out = Buffer.alloc(w * h * 4);
  const prev = Buffer.alloc(stride);
  let pos = 0;
  const cur = Buffer.alloc(stride);
  const pa = (a, b, c) => { const p2 = a + b - c, pa2 = Math.abs(p2 - a), pb = Math.abs(p2 - b), pc = Math.abs(p2 - c); return pa2 <= pb && pa2 <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < h; y++) {
    const f = raw[pos++];
    for (let i = 0; i < stride; i++) {
      const x = raw[pos++];
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev[i];
      const c = i >= ch ? prev[i - ch] : 0;
      let v;
      if (f === 0) v = x; else if (f === 1) v = x + a; else if (f === 2) v = x + b; else if (f === 3) v = x + ((a + b) >> 1); else v = x + pa(a, b, c);
      cur[i] = v & 255;
    }
    for (let xp = 0; xp < w; xp++) {
      const o = (y * w + xp) * 4;
      if (ct === 2) { out[o] = cur[xp * 3]; out[o + 1] = cur[xp * 3 + 1]; out[o + 2] = cur[xp * 3 + 2]; out[o + 3] = 255; }
      else if (ct === 6) { out[o] = cur[xp * 4]; out[o + 1] = cur[xp * 4 + 1]; out[o + 2] = cur[xp * 4 + 2]; out[o + 3] = cur[xp * 4 + 3]; }
      else if (ct === 0) { out[o] = out[o + 1] = out[o + 2] = cur[xp]; out[o + 3] = 255; }
      else if (ct === 3) { const idx = cur[xp]; out[o] = palette[idx * 3]; out[o + 1] = palette[idx * 3 + 1]; out[o + 2] = palette[idx * 3 + 2]; out[o + 3] = 255; }
    }
    cur.copy(prev);
  }
  return { w, h, rgba: out };
}

function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0); const body = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0, 0); return Buffer.concat([len, body, crc]); };
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return c ^ 0xffffffff; }

function get(img, x, y) { const o = (y * img.w + x) * 4; return [img.rgba[o], img.rgba[o + 1], img.rgba[o + 2], img.rgba[o + 3]]; }

// ---- 2) PANDA: white -> transparent, then trim + pad into a square ----
function makePandaTransparent() {
  const img = decodePNG(readFileSync(resolve(PUB, 'IMG_7365.PNG')));
  const { w, h, rgba } = img;
  // alpha: white-ish -> transparent (soft threshold)
  for (let i = 0; i < w * h; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
    const minc = Math.min(r, g, b);
    // distance from white
    const d = 255 - minc;
    let a = 255;
    if (d < 24) a = 0; else if (d < 60) a = Math.round(((d - 24) / 36) * 255);
    rgba[i * 4 + 3] = a;
  }
  // bounding box of opaque pixels
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (rgba[(y * w + x) * 4 + 3] > 16) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; } }
  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  const side = Math.round(Math.max(bw, bh) * 1.12);
  const out = Buffer.alloc(side * side * 4); // transparent
  const ox = Math.round((side - bw) / 2), oy = Math.round((side - bh) / 2);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const s = ((minY + y) * w + (minX + x)) * 4;
    const d = ((oy + y) * side + (ox + x)) * 4;
    out[d] = rgba[s]; out[d + 1] = rgba[s + 1]; out[d + 2] = rgba[s + 2]; out[d + 3] = rgba[s + 3];
  }
  writeFileSync(resolve(PUB, 'panda.png'), encodePNG(side, side, out));
  console.log('panda.png', `${side}x${side} (trimmed, transparent)`);
}

// ---- 1) APP ICON: paint the logo on a solid white 1024 square ----
// The source already shows the logo on a white tile with a drop shadow + sparkle.
// Simplest robust approach: composite the source over solid white (kills the
// outer light-grey background + shadow softness becomes white), giving a clean
// full-bleed white icon with the green logo centered.
function makeAppIcon() {
  const img = decodePNG(readFileSync(resolve(PUB, 'IMG_7364.PNG')));
  const { w, h, rgba } = img;
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
    // Treat anything that's basically light-grey/white as pure white; keep the
    // green logo as-is. Green has g notably higher than r,b.
    const isGreen = g > 120 && g > r + 30 && g > b + 30;
    if (isGreen) { out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; }
    else { out[i * 4] = 255; out[i * 4 + 1] = 255; out[i * 4 + 2] = 255; }
    out[i * 4 + 3] = 255;
  }
  writeFileSync(resolve(PUB, 'app-icon-clean.png'), encodePNG(w, h, out));
  console.log('app-icon-clean.png', `${w}x${h} (white bg + green logo)`);
}

makePandaTransparent();
makeAppIcon();
console.log('done');
