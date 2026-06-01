// Generates the Stella app icon (yellow rounded star + face) on a white bg.
// Pure Node + zlib PNG encoder (no deps). Outputs PWA icons, apple-touch,
// favicon source and a 1024 master for @capacitor/assets.
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');
const ASSETS = resolve(__dirname, '../assets');
mkdirSync(resolve(PUBLIC, 'icons'), { recursive: true });
mkdirSync(ASSETS, { recursive: true });

const STAR = [255, 201, 60]; // #FFC93C
const EYE = [27, 27, 47]; // #1B1B2F
const MOUTH = [255, 77, 94]; // #FF4D5E

// Rounded 5-point star as a superformula-ish radial function, sampled with AA.
function starRadius(angle, R) {
  // 5 points; rounded by blending the star spikes with a circle.
  const spikes = 5;
  const inner = 0.52;
  // triangle wave for star
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const seg = (a / (2 * Math.PI)) * spikes;
  const f = Math.abs((seg % 1) - 0.5) * 2; // 0 at point, 1 at valley
  const star = 1 - (1 - inner) * f;
  // round it by mixing with a circle
  return R * (0.78 * star + 0.22);
}

function blend(base, over, alpha) {
  return base.map((b, i) => Math.round(b * (1 - alpha) + over[i] * alpha));
}

function draw(size, bg, scale = 0.40) {
  const px = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const R = size * scale;
  // slight tilt
  const tilt = -0.14;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let dx = x + 0.5 - cx;
      let dy = y + 0.5 - cy;
      // rotate
      const rx = dx * Math.cos(-tilt) - dy * Math.sin(-tilt);
      const ry = dx * Math.sin(-tilt) + dy * Math.cos(-tilt);
      const dist = Math.sqrt(rx * rx + ry * ry);
      const ang = Math.atan2(ry, rx) - Math.PI / 2; // point up
      const rEdge = starRadius(ang, R);
      let color = bg;
      const aa = Math.max(0, Math.min(1, rEdge - dist + 0.5));
      if (aa > 0) color = blend(bg, STAR, aa);

      // face features (relative to center, in rotated space)
      // left eye
      if (within(rx, ry, -R * 0.18, R * 0.05, R * 0.085)) color = EYE;
      // right eye
      if (within(rx, ry, R * 0.16, -R * 0.08, R * 0.095)) color = EYE;
      // eye highlights
      if (within(rx, ry, -R * 0.15, R * 0.01, R * 0.03)) color = [255, 255, 255];
      if (within(rx, ry, R * 0.19, -R * 0.12, R * 0.033)) color = [255, 255, 255];
      // mouth (small oval)
      if (withinOval(rx, ry, R * 0.02, R * 0.16, R * 0.06, R * 0.042)) color = MOUTH;

      const i = (y * size + x) * 4;
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }
  return encodePNG(size, size, px);
}

function within(x, y, ox, oy, r) {
  const dx = x - ox;
  const dy = y - oy;
  return dx * dx + dy * dy <= r * r;
}
function withinOval(x, y, ox, oy, rx, ry) {
  const dx = (x - ox) / rx;
  const dy = (y - oy) / ry;
  return dx * dx + dy * dy <= 1;
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

const WHITE = [255, 255, 255];
// App icons: white background, Stella centered
writeFileSync(resolve(ASSETS, 'icon.png'), draw(1024, WHITE));
writeFileSync(resolve(PUBLIC, 'icons/icon-192.png'), draw(192, WHITE));
writeFileSync(resolve(PUBLIC, 'icons/icon-512.png'), draw(512, WHITE));
writeFileSync(resolve(PUBLIC, 'icons/icon-512-maskable.png'), draw(512, WHITE, 0.30));
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), draw(180, WHITE));
// Splash screens: small centered Stella on a large canvas
const DARK = [10, 10, 12];
writeFileSync(resolve(ASSETS, 'splash.png'), draw(2732, WHITE, 0.13));
writeFileSync(resolve(ASSETS, 'splash-dark.png'), draw(2732, DARK, 0.13));
console.log('Stella icons + splash generated.');
