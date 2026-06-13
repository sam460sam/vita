// Generates a small tiling film-grain PNG for the header finish (redesign A5).
// Grayscale noise centered on mid-gray so it's neutral under `overlay` blend;
// the actual subtlety is set in CSS via low layer opacity. Pure Node (zlib).
// Run: node scripts/make-grain.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const S = 128;
// Deterministic LCG so the texture is stable across regenerations.
let seed = 1337;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0; // filter: none
  for (let x = 0; x < S; x++) {
    const n = 128 + Math.round((rand() - 0.5) * 90); // mid-gray ± ~45
    const i = y * (S * 4 + 1) + 1 + x * 4;
    raw[i] = raw[i + 1] = raw[i + 2] = n;
    raw[i + 3] = 255;
  }
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
const crc32 = (b) => {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../src/assets/grain.png');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log('Wrote', out, `(${png.length} bytes)`);
