import { useId } from 'react';
import { cn } from '@/lib/cn';

type Mood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

/**
 * Vyta's brand mark — a bold, rounded "V" in the sunset-orange gradient.
 * Kept under the StarMascot name + `mood`/`animated` props so every existing
 * call site (home, header, onboarding, recap, assistant…) renders the logo
 * without changes. `mood` is ignored; the artwork is fixed. Transparent
 * background so it sits cleanly inside gradient halos and progress rings.
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
  const gid = useId();
  return (
    <span
      className={cn('inline-flex items-center justify-center', animated && 'animate-stella-float', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Vyta"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="select-none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`v-${gid}`} x1="20" y1="22" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff9a5a" />
            <stop offset="1" stopColor="#ff5a3d" />
          </linearGradient>
        </defs>
        <path
          d="M26 30 L50 72 L74 30"
          fill="none"
          stroke={`url(#v-${gid})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* tiny spark on the right arm — keeps a friendly, lively feel */}
        <circle cx="80" cy="24" r="5.5" fill="#ffc36b" />
      </svg>
    </span>
  );
}
