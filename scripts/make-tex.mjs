// Texture for "yta" = the V logo artwork itself, composited over leaf green so
// transparent gaps become green (the letters read as cut from the same V).
import { readFileSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer';
const src = readFileSync('public/vyta-v.png').toString('base64');
const br = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
const p = await br.newPage(); await p.setContent('<body></body>');
const url = await p.evaluate(async (b64) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d');
  // leaf-green backfill (mid tone sampled from the logo)
  x.fillStyle = '#6aa742';
  x.fillRect(0, 0, c.width, c.height);
  x.drawImage(img, 0, 0);
  return c.toDataURL('image/png');
}, src);
writeFileSync('public/leaf-tex.png', Buffer.from(url.split(',')[1], 'base64'));
console.log('wrote public/leaf-tex.png');
await br.close();
