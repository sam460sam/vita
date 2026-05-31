// Generates source assets for @capacitor/assets (no image deps):
//  - assets/icon.png        1024x1024  rings on dark bg
//  - assets/splash.png      2732x2732  centered rings on white
//  - assets/splash-dark.png 2732x2732  centered rings on dark
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../assets');
mkdirSync(OUT, { recursive: true });

const RINGS = [
  [255, 107, 87],
  [16, 185, 129],
  [79, 70, 229],
];

function blend(base, over, a) {
  return base.map((b, i) => Math.round(b * (1 - a) + over[i] * a));
}

// ringScale = fraction of half-size occupied by the outer ring
function draw(size, bg, ringScale) {
  const px = Buffer.alloc(size * size * 4);
  const c = size / 2;
  const usable = (size / 2) * ringScale;
  const stroke = usable * 0.16;
  const gap = stroke * 0.55;
  const radii = RINGS.map((_, i) => usable - stroke / 2 - i * (stroke + gap));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c;
      const dy = y + 0.5 - c;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let color = bg;
      for (let r = 0; r < radii.length; r++) {
        const d = Math.abs(dist - radii[r]);
        if (d <= stroke / 2) color = blend(color, RINGS[r], Math.max(0, Math.min(1, stroke / 2 - d)));
      }
      const i = (y * size + x) * 4;
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }
  return encodePNG(size, size, px);
}

function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crc]);
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const DARK = [10, 10, 12];
const WHITE = [255, 255, 255];

writeFileSync(resolve(OUT, 'icon.png'), draw(1024, DARK, 0.78));
writeFileSync(resolve(OUT, 'splash.png'), draw(2732, WHITE, 0.18));
writeFileSync(resolve(OUT, 'splash-dark.png'), draw(2732, DARK, 0.18));
console.log('Native source assets generated in assets/');
