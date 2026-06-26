// ============================================================================
// Client-side image compression (BUILD-SPEC §4).
// Resize to <= maxEdge on the long side, re-encode JPEG at the given quality,
// BEFORE upload. This slashes the vision-model token cost (≈ <$0.001 / scan).
// ============================================================================
import { CONFIG } from './config';

export interface ProcessedImage {
  /** data URL (image/jpeg) for previewing in the UI + storing in the collection. */
  dataUrl: string;
  /** base64 body only (no "data:..." prefix) — what we POST to the proxy. */
  base64: string;
  width: number;
  height: number;
  /** approx encoded size in bytes (for debugging / display). */
  bytes: number;
}

/**
 * Take any image source (data URL, blob URL, object URL or remote URL) and
 * return a downscaled, recompressed JPEG.
 */
export async function processImage(
  src: string,
  maxEdge = CONFIG.image.maxEdge,
  quality = CONFIG.image.jpegQuality,
): Promise<ProcessedImage> {
  const img = await loadImage(src);

  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  // Better downscaling quality.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = dataUrl.split(',')[1] ?? '';
  const bytes = Math.round((base64.length * 3) / 4);

  return { dataUrl, base64, width, height, bytes };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}
