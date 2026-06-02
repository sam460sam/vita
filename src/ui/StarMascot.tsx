import { cn } from '@/lib/cn';
import pandaUrl from '/panda.png';

type Mood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

/**
 * Vita's mascot — the user-provided panda image. Kept under the StarMascot
 * name + `mood` prop so existing call sites don't change (mood currently just
 * tweaks the float animation; the artwork is fixed).
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
    <img
      src={pandaUrl}
      width={size}
      height={size}
      alt="Panda"
      draggable={false}
      className={cn('object-contain select-none', animated && 'animate-stella-float', className)}
      style={{ width: size, height: size }}
    />
  );
}
