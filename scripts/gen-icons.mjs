// One-off icon generator: draws the Vita activity-rings motif on a dark
// background and writes PNGs with Node's built-in zlib (no deps).
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');
mkdirSync(resolve(PUBLIC, 'icons'), { recursive: true });

const BG = [10, 10, 12]; // #0A0A0C
const RINGS = [
  [255, 107, 87], // coral
  [16, 185, 129], // green
  [79, 70, 229], // indigo
];

function hexBlend(base, over, a) {
  return base.map((b, i) => Math.round(b * (1 - a) + over[i] * a));
}

function draw(size, padScale) {
  const px = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const usable = (size / 2) * padScale;
  const stroke = usable * 0.16;
  const gap = stroke * 0.55;
  // ring radii outer->inner
  const radii = RINGS.map((_, i) => usable - stroke / 2 - i * (stroke + gap));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let color = BG;
      for (let r = 0; r < radii.length; r++) {
        const rad = radii[r];
        const d = Math.abs(dist - rad);
        if (d <= stroke / 2) {
          // anti-alias edge over ~1px
          const edge = stroke / 2 - d;
          const a = Math.max(0, Math.min(1, edge));
          color = hexBlend(color, RINGS[r], a);
        }
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
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  // scanlines with filter byte 0
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
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([len, body, crc]);
}

const CRC_TABLE = (() => {
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
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

writeFileSync(resolve(PUBLIC, 'icons/icon-192.png'), draw(192, 0.78));
writeFileSync(resolve(PUBLIC, 'icons/icon-512.png'), draw(512, 0.78));
writeFileSync(resolve(PUBLIC, 'icons/icon-512-maskable.png'), draw(512, 0.6));
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), draw(180, 0.78));
console.log('Icons generated.');
