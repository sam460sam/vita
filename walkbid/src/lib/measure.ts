// On-site measurement helpers. Hardscape is measured in the field; these back
// the SF calculator (L×W summed) and the CY helper (L×W×depth-in → cubic yards).
import { round2 } from '@/services/estimates';

export interface AreaRow {
  l: number; // feet
  w: number; // feet
}

/** Sum of L×W areas, in square feet. */
export function areaSF(rows: AreaRow[]): number {
  return round2(rows.reduce((s, r) => s + (r.l || 0) * (r.w || 0), 0));
}

/**
 * Cubic yards for an area at a given depth in inches.
 * 20ft × 20ft × 6in = 400 sf × 0.5 ft / 27 = 7.41 cy (spec QA §8).
 */
export function cubicYards(l: number, w: number, depthInches: number): number {
  const cf = (l || 0) * (w || 0) * ((depthInches || 0) / 12);
  return round2(cf / 27);
}

/** Cubic yards from a known square footage + depth in inches. */
export function cubicYardsFromSF(sf: number, depthInches: number): number {
  return round2((sf * ((depthInches || 0) / 12)) / 27);
}
