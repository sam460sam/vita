import { Capacitor, registerPlugin } from '@capacitor/core';
import type { WorkoutEntry } from '@/data/types';
import { newWorkoutEntry } from '@/data/repo';
import { EXERCISES, exerciseName } from './exercises';

interface OcrPlugin {
  recognize(options: { image: string }): Promise<{ lines: string[] }>;
}
const Ocr = registerPlugin<OcrPlugin>('OcrBridge');

export function ocrAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

/** Run on-device OCR over a data-URL image. Returns [] if unavailable/offline. */
export async function ocrImage(dataUrl: string): Promise<string[]> {
  try {
    const r = await Ocr.recognize({ image: dataUrl });
    return r.lines ?? [];
  } catch {
    return [];
  }
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
}

/**
 * Best-effort parse of OCR'd workout-plan lines into entries: match each line
 * against the exercise library and pull sets×reps and weight when present.
 */
export function parseWorkout(lines: string[], lang: string): WorkoutEntry[] {
  const entries: WorkoutEntry[] = [];
  const seen = new Set<string>();

  for (const raw of lines) {
    const lower = raw.trim().toLowerCase();
    if (lower.length < 3) continue;

    const def = EXERCISES.find((e) => lower.includes(e.name.toLowerCase()) || lower.includes(e.nameEn.toLowerCase()));
    if (!def || seen.has(def.id)) continue;
    seen.add(def.id);

    const sx = lower.match(/(\d+)\s*[x×]\s*(\d+)/);
    const kgm = lower.match(/(\d+(?:[.,]\d+)?)\s*(kg|lb)/);
    let sets = 3;
    let reps = 10;
    let kg = 0;
    if (sx) {
      sets = clamp(parseInt(sx[1], 10), 1, 12);
      reps = clamp(parseInt(sx[2], 10), 1, 100);
    }
    if (kgm) {
      kg = parseFloat(kgm[1].replace(',', '.'));
      if (kgm[2] === 'lb') kg = Math.round(kg * 0.4536);
    }

    const entry = newWorkoutEntry(def.id, exerciseName(def, lang), def.muscle);
    entry.sets = Array.from({ length: sets }, () => ({ reps, weightKg: kg, done: false }));
    entries.push(entry);
  }
  return entries;
}
