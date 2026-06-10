// Generate a 1024x1024 "candy" subscription/app cover image.
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../store/cover');
mkdirSync(OUT, { recursive: true });

const panda = readFileSync(resolve(__dirname, '../public/panda.png')).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1024px; height:1024px; }
  .stage {
    width:1024px; height:1024px; position:relative; overflow:hidden;
    background:
      radial-gradient(120% 120% at 18% 12%, #FFD9E2 0%, rgba(255,217,226,0) 45%),
      radial-gradient(120% 120% at 86% 22%, #E2EEFF 0%, rgba(226,238,255,0) 48%),
      radial-gradient(140% 140% at 80% 100%, #EFE6FF 0%, rgba(239,230,255,0) 55%),
      linear-gradient(135deg, #FBEFF2 0%, #F2ECFB 52%, #E9F2FC 100%);
    font-family: 'SF Pro Rounded','Nunito','Helvetica Neue',Arial,sans-serif;
  }
  .blob { position:absolute; border-radius:50%; filter:blur(8px); opacity:.5; }
  .b1 { width:360px;height:360px; background:#FF8AA0; top:-120px; left:-90px; opacity:.35; }
  .b2 { width:300px;height:300px; background:#9FB8FF; bottom:-80px; right:-60px; opacity:.30; }
  .col { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .tile {
    width:470px; height:470px; border-radius:140px; background:#ffffff;
    box-shadow: 0 40px 90px rgba(255,90,110,.18), 0 12px 30px rgba(0,0,0,.06);
    display:flex; align-items:center; justify-content:center;
    border: 1px solid rgba(255,255,255,.8);
  }
  .tile img { width:330px; height:330px; object-fit:contain; transform: translateY(6px); }
  .word { margin-top:54px; font-size:148px; font-weight:800; color:#1A1A1A; letter-spacing:-2px; line-height:1; position:relative; }
  .dot { color:#FF5A6E; }
  .tag { margin-top:18px; font-size:36px; font-weight:600; color:#8A8A8E; }
  .spark { position:absolute; right:-54px; top:6px; font-size:54px; color:#FF5A6E; }
</style></head>
<body><div class="stage">
  <div class="blob b1"></div><div class="blob b2"></div>
  <div class="col">
    <div class="tile"><img src="data:image/png;base64,${panda}" alt="Vyta"/></div>
    <div class="word">Vyta<span class="spark">✦</span><span class="dot">.</span></div>
    <div class="tag">La tua vita, un posto solo</div>
  </div>
</div></body></html>`;

import { writeFileSync } from 'node:fs';

// Force a JFIF APP0 segment with 72 DPI (units=1, 72x72) — App Store Connect
// requires 72 dpi, RGB, flattened. JPEG is inherently flattened (no alpha).
function set72dpiJpeg(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return buf;
  if (buf[2] === 0xff && buf[3] === 0xe0 && buf.toString('latin1', 6, 10) === 'JFIF') {
    buf[13] = 1; buf.writeUInt16BE(72, 14); buf.writeUInt16BE(72, 16);
    return buf;
  }
  const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00]);
  return Buffer.concat([buf.subarray(0, 2), app0, buf.subarray(2)]);
}

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.screenshot({ path: resolve(OUT, 'vyta-cover-1024.png') });
const jpg = await page.screenshot({ type: 'jpeg', quality: 95 });
writeFileSync(resolve(OUT, 'vyta-cover-1024.jpg'), set72dpiJpeg(Buffer.from(jpg)));
await browser.close();
console.log('cover →', resolve(OUT, 'vyta-cover-1024.jpg'));
