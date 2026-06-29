import vSeme from '/vio/seme.png';
import vGermoglio from '/vio/germoglio.png';
import vPianta from '/vio/pianta.png';
import vFioritura from '/vio/fioritura.png';
import vHappy from '/vio/vio-happy.png';
import vSleepy from '/vio/vio-sleepy.png';
import vWait from '/vio/vio-wait.png';
import { cn } from '@/lib/cn';

// ---------------------------------------------------------------------------
// Vio — the botanical companion. A little sprout that grows with the user's
// Momentum: Seed (0–25) → Sprout (26–50) → Plant (51–75) → Bloom (76–100).
// It also has gentle moods: happy (great day), sleepy (evening), waiting
// (a missed day — never shaming, it just waits for you).
// ---------------------------------------------------------------------------
export type VioStage = 'seme' | 'germoglio' | 'pianta' | 'fioritura';
export type VioMood = 'happy' | 'sleepy' | 'waiting';

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

const MOOD_SRC: Record<VioMood, string> = {
  happy: vHappy,
  sleepy: vSleepy,
  waiting: vWait,
};

export function VioCompanion({
  score,
  stage,
  mood,
  size = 56,
  animated = false,
  className,
}: {
  /** Momentum score 0–100 — picks the growth stage automatically. */
  score?: number;
  /** Force a specific stage (overrides `score`). */
  stage?: VioStage;
  /** Show a mood expression instead of a growth stage. */
  mood?: VioMood;
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const src = mood ? MOOD_SRC[mood] : SRC[stage ?? vioStageForScore(score ?? 0)];
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      className={cn('object-contain select-none pointer-events-none', animated && 'vio-bob', className)}
      style={{ width: size, height: size }}
    />
  );
}

