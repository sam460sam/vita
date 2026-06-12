import { cn } from '@/lib/cn';
import vLogoUrl from '/vyta-v.png';

type Mood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

/**
 * Vyta's brand mark — the green botanical "V" logo. Kept under the StarMascot
 * name + `mood`/`animated` props so every existing call site (home, header,
 * onboarding, recap, assistant…) renders the logo without changes. `mood` is
 * ignored; the artwork is fixed. Transparent background so it sits cleanly
 * inside gradient halos and progress rings, in both light and dark themes.
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
      className={cn('inline-flex items-center justify-center', animated && 'animate-stella-float', className)}
      style={{ width: size, height: size }}
    >
      <img
        src={vLogoUrl}
        alt="Vyta"
        draggable={false}
        className="object-contain select-none"
        style={{ width: size, height: size }}
      />
    </span>
  );
}
