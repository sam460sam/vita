// ============================================================================
// Generate a beautiful shareable card (PNG) of an identified stone — the free
// viral loop (BUILD-SPEC §2.5). Pure canvas, no dependencies.
// ============================================================================
import type { Candidate } from '@/lib/api';

interface CardInput {
  photoDataUrl: string;
  candidate: Candidate;
}

const W = 1080;
const H = 1350;

export async function buildShareCard({ photoDataUrl, candidate }: CardInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  // Background gradient (anthracite → amethyst tint).
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0a0a0d');
  bg.addColorStop(1, '#1a1130');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Photo, rounded, centered top.
  const img = await loadImage(photoDataUrl);
  const photoSize = 760;
  const px = (W - photoSize) / 2;
  const py = 150;
  roundRect(ctx, px, py, photoSize, photoSize, 48);
  ctx.save();
  ctx.clip();
  // cover-fit
  const ratio = Math.max(photoSize / img.width, photoSize / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, px + (photoSize - dw) / 2, py + (photoSize - dh) / 2, dw, dh);
  ctx.restore();

  // Subtle border on the photo.
  roundRect(ctx, px, py, photoSize, photoSize, 48);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Confidence chip.
  const chipText = `${Math.round(candidate.confidence)}% match`;
  ctx.font = '600 34px -apple-system, system-ui, sans-serif';
  const chipW = ctx.measureText(chipText).width + 56;
  const chipX = (W - chipW) / 2;
  const chipY = py + photoSize - 70;
  roundRect(ctx, chipX, chipY, chipW, 64, 32);
  ctx.fillStyle = 'rgba(168,123,255,0.92)';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chipText, W / 2, chipY + 33);

  // Common name.
  ctx.fillStyle = '#f5f4f8';
  ctx.font = '700 76px -apple-system, system-ui, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(truncate(ctx, candidate.common_name, W - 120), W / 2, py + photoSize + 130);

  // Scientific name.
  if (candidate.scientific_name) {
    ctx.fillStyle = '#a7a4b3';
    ctx.font = 'italic 400 40px -apple-system, system-ui, sans-serif';
    ctx.fillText(truncate(ctx, candidate.scientific_name, W - 160), W / 2, py + photoSize + 190);
  }

  // Mohs hardness line.
  if (candidate.mohs_hardness) {
    ctx.fillStyle = '#f0c3ff';
    ctx.font = '600 34px -apple-system, system-ui, sans-serif';
    ctx.fillText(`Mohs hardness · ${candidate.mohs_hardness}`, W / 2, py + photoSize + 256);
  }

  // Footer brand.
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 36px -apple-system, system-ui, sans-serif';
  ctx.fillText('◆ Identified with Geode', W / 2, H - 70);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png', 0.92),
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}
