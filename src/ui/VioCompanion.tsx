import vSeme from '/vio/seme.png';
import vGermoglio from '/vio/germoglio.png';
import vPianta from '/vio/pianta.png';
import vFioritura from '/vio/fioritura.png';
import { cn } from '@/lib/cn';

// ---------------------------------------------------------------------------
// Vio — the botanical companion. A little sprout that grows with the user's
// Momentum: Seed (0–25) → Sprout (26–50) → Plant (51–75) → Bloom (76–100).
// Gentle by design: it never wilts or shames a missed day, it just waits.
// ---------------------------------------------------------------------------
export type VioStage = 'seme' | 'germoglio' | 'pianta' | 'fioritura';

export function vioStageForScore(score: number): VioStage {
  if (score <= 25) return 'seme';
  if (score <= 50) return 'germoglio';
  if (score <= 75) return 'pianta';
  return 'fioritura';
}

const SRC: Record<VioStage, string> = {
  seme: vSeme,
  germoglio: vGermoglio,
  pianta: vPianta,
  fioritura: vFioritura,
};

export function VioCompanion({
  score,
  stage,
  size = 56,
  animated = false,
  className,
}: {
  /** Momentum score 0–100 — picks the growth stage automatically. */
  score?: number;
  /** Force a specific stage (overrides `score`). */
  stage?: VioStage;
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const s = stage ?? vioStageForScore(score ?? 0);
  return (
    <img
      src={SRC[s]}
      alt=""
      aria-hidden
      draggable={false}
      className={cn('object-contain select-none pointer-events-none', animated && 'vio-bob', className)}
      style={{ width: size, height: size }}
    />
  );
}
