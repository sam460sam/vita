import { useId } from 'react';
import { cn } from '@/lib/cn';
import { roundedStarPath } from './starPath';

/**
 * Stella — the friendly star mascot, Pixar-style: volumetric gradient body,
 * glossy highlight, symmetric eyes with catchlights, rosy cheeks, soft shadow.
 * Pure SVG so it stays crisp at any size.
 */
export function StarMascot({
  size = 96,
  className,
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const body = roundedStarPath(100, 98, 78, 40, 5, 0.34);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-stella-float', className)}
      role="img"
      aria-label="Stella"
    >
      <defs>
        <radialGradient id={`body-${uid}`} cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="48%" stopColor="#FFD23F" />
          <stop offset="100%" stopColor="#F7B500" />
        </radialGradient>
        <radialGradient id={`gloss-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`eye-${uid}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#3A3A52" />
          <stop offset="100%" stopColor="#15152A" />
        </radialGradient>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="100" cy="180" rx="40" ry="8" fill="#000000" opacity="0.06" />

      <g transform="rotate(-6 100 98)">
        {/* body */}
        <path d={body} fill={`url(#body-${uid})`} />
        {/* subtle inner depth at the bottom */}
        <path d={body} fill="#E89E00" opacity="0.12" transform="translate(0 6) scale(0.98)" style={{ transformOrigin: '100px 98px' }} />
        {/* top gloss highlight */}
        <ellipse cx="78" cy="64" rx="46" ry="34" fill={`url(#gloss-${uid})`} opacity="0.7" />
      </g>

      {/* rosy cheeks */}
      <ellipse cx="68" cy="112" rx="11" ry="7" fill="#FF8FA3" opacity="0.55" />
      <ellipse cx="128" cy="108" rx="11" ry="7" fill="#FF8FA3" opacity="0.55" />

      {/* symmetric eyes */}
      <ellipse cx="82" cy="96" rx="11" ry="12.5" fill={`url(#eye-${uid})`} />
      <ellipse cx="118" cy="96" rx="11" ry="12.5" fill={`url(#eye-${uid})`} />
      {/* big catchlights */}
      <circle cx="78.5" cy="91" r="3.6" fill="#fff" />
      <circle cx="114.5" cy="91" r="3.6" fill="#fff" />
      {/* tiny secondary sparkle */}
      <circle cx="85" cy="99.5" r="1.7" fill="#fff" opacity="0.8" />
      <circle cx="121" cy="99.5" r="1.7" fill="#fff" opacity="0.8" />

      {/* smile */}
      <path d="M92 116 Q100 124 108 116" stroke="#C2410C" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.55" />
    </svg>
  );
}
