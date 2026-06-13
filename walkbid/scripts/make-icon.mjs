// Generates the WalkBid app icon (1024×1024) with no external deps: the
// MilestoneBar motif — the app's signature element — on an asphalt tile.
// Pure Node PNG encoder (zlib only). Run: node scripts/make-icon.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const S = 1024;
const buf = Buffer.alloc(S * S * 4);

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ASPHALT = hex('#0E1013');
const GRAPHITE = hex('#16191E');
const STEEL = hex('#262B33');
const SIGNAL = hex('#FFC400');
const SAFETY = hex('#FF6A00');
const GO = hex('#22C55E');

function px(x, y, [r, g, b], a = 255) {
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const i = (y * S + x) * 4;
  buf[i] = r;
  buf[i + 1] = g;
  buf[i + 2] = b;
  buf[i + 3] = a;
}

// Rounded-rect fill with a corner radius.
function rrect(x0, y0, x1, y1, rad, color) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      let inside = true;
      const corners = [
        [x0 + rad, y0 + rad],
        [x1 - rad, y0 + rad],
        [x0 + rad, y1 - rad],
        [x1 - rad, y1 - rad],
      ];
      if (x < x0 + rad || x > x1 - rad) {
        if (y < y0 + rad || y > y1 - rad) {
          inside = corners.some(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad);
        }
      }
      if (inside) px(x, y, color);
    }
  }
}

// Background asphalt
for (let i = 0; i < S * S; i++) {
  buf[i * 4] = ASPHALT[0];
  buf[i * 4 + 1] = ASPHALT[1];
  buf[i * 4 + 2] = ASPHALT[2];
  buf[i * 4 + 3] = 255;
}

// Graphite tile (the "card")
rrect(150, 150, 874, 874, 150, GRAPHITE);
// Steel hairline inset
rrect(150, 150, 874, 874, 150, GRAPHITE);

// MilestoneBar track + three colored segments
const bx0 = 250,
  bx1 = 774,
  by0 = 470,
  by1 = 554,
  brad = 42;
rrect(bx0, by0, bx1, by1, brad, STEEL);
const w = bx1 - bx0;
rrect(bx0, by0, bx0 + Math.round(w * 0.4), by1, brad, SIGNAL);
rrect(bx0 + Math.round(w * 0.4), by0, bx0 + Math.round(w * 0.72), by1, 0, SAFETY);
rrect(bx0 + Math.round(w * 0.72), by0, bx1, by1, brad, GO);

// Safety-orange marker dot above the bar (the FAB / "you are here")
const cx = bx0 + Math.round(w * 0.72),
  cy = 360,
  cr = 46;
for (let y = cy - cr; y <= cy + cr; y++) for (let x = cx - cr; x <= cx + cr; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= cr * cr) px(x, y, SAFETY);

// ---- PNG encode ----
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td) >>> 0, 0);
  return Buffer.concat([len, td, crc]);
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
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0; // filter none
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
// Also keep a copy for web/PWA use.
mkdirSync(resolve(here, '../public'), { recursive: true });
writeFileSync(resolve(here, '../public/icon-1024.png'), png);
console.log('Wrote', out, `(${png.length} bytes)`);
