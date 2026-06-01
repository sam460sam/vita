// Builds a shareable PNG of the weekly recap, fully in the browser (SVG→canvas).
// No html2canvas dependency.
import type { WeeklyRecap } from './logic';

interface RecapStrings {
  week: string;
  habits: string;
  water: string;
  workouts: string;
  tasks: string;
  journal: string;
  tagline: string;
  name?: string;
}

const STAR = `<g transform="translate(470 70)">
  <path d="M0 -34 L9 -10 L34 -9 L14 7 L20 32 L0 18 L-20 32 L-14 7 L-34 -9 L-9 -10 Z" fill="#FFD23F" stroke="#F7B500" stroke-width="2"/>
  <circle cx="-8" cy="2" r="4.5" fill="#15152A"/><circle cx="8" cy="2" r="4.5" fill="#15152A"/>
  <path d="M-6 12 Q0 18 6 12" stroke="#C2410C" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>`;

function row(y: number, label: string, value: string, color: string): string {
  return `
    <circle cx="56" cy="${y}" r="6" fill="${color}"/>
    <text x="78" y="${y + 6}" font-size="26" fill="#E5E7EB" font-family="Inter, sans-serif">${label}</text>
    <text x="544" y="${y + 6}" font-size="28" font-weight="700" fill="#fff" text-anchor="end" font-family="Inter, sans-serif">${value}</text>`;
}

export function buildRecapSVG(r: WeeklyRecap, s: RecapStrings): string {
  const liters = `${(r.waterMl / 1000).toFixed(1)} L`;
  const title = s.name ? `${s.name} · ${s.week}` : s.week;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0F1116"/><stop offset="100%" stop-color="#16181F"/>
      </linearGradient>
    </defs>
    <rect width="600" height="600" rx="40" fill="url(#bg)"/>
    ${STAR}
    <text x="56" y="150" font-size="22" fill="#9CA3AF" font-family="Inter, sans-serif" letter-spacing="2">${title.toUpperCase()}</text>
    <text x="56" y="190" font-size="40" font-weight="800" fill="#fff" font-family="Inter, sans-serif">Vita</text>
    ${row(270, s.habits, String(r.habitsCompleted), '#10B981')}
    ${row(320, s.water, liters, '#0EA5E9')}
    ${row(370, s.workouts, String(r.workouts), '#FF6B57')}
    ${row(420, s.tasks, String(r.tasksCompleted), '#4F46E5')}
    ${row(470, s.journal, String(r.journalEntries), '#F59E0B')}
    <text x="300" y="552" font-size="22" fill="#6B7280" text-anchor="middle" font-family="Inter, sans-serif">${s.tagline}</text>
  </svg>`;
}

/** Render an SVG string to a PNG blob via an offscreen canvas. */
export function svgToPngBlob(svg: string, size = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svg64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    };
    img.onerror = reject;
    img.src = svg64;
  });
}
