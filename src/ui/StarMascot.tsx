import { cn } from '@/lib/cn';
import pandaUrl from '/panda.png';

type Mood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

/**
 * Vita's mascot — the user-provided panda image. Kept under the StarMascot
 * name + `mood` prop so existing call sites don't change (mood currently just
 * tweaks the float animation; the artwork is fixed).
 *
 * The panda is dark line-art on a transparent background, so on the true-black
 * dark theme it would disappear. In dark mode we place it on a soft light disc
 * so it stays visible; in light mode it renders exactly as the original art.
 */
export function StarMascot({
  size = 96,
  className,
  animated = false,
  mood: _mood = 'happy',
}: {
  size?: number;
  className?: string;
  animated?: boolean;
  mood?: Mood;
}) {
  void _mood;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full dark:bg-[#FBFAF4]',
        animated && 'animate-stella-float',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={pandaUrl}
        alt="Panda"
        draggable={false}
        className="object-contain select-none"
        style={{ width: size * 0.84, height: size * 0.84 }}
      />
    </span>
  );
}
