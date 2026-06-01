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
  mood = 'happy',
}: {
  size?: number;
  className?: string;
  animated?: boolean;
  mood?: 'sleepy' | 'neutral' | 'happy' | 'starstruck';
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

      {/* rosy cheeks (brighter when happy/starstruck) */}
      <ellipse cx="68" cy="112" rx="11" ry="7" fill="#FF8FA3" opacity={mood === 'starstruck' || mood === 'happy' ? 0.7 : 0.4} />
      <ellipse cx="128" cy="108" rx="11" ry="7" fill="#FF8FA3" opacity={mood === 'starstruck' || mood === 'happy' ? 0.7 : 0.4} />

      <Face uid={uid} mood={mood} />
    </svg>
  );
}

function Face({ uid, mood }: { uid: string; mood: 'sleepy' | 'neutral' | 'happy' | 'starstruck' }) {
  if (mood === 'sleepy') {
    // closed/calm eyes (gentle arcs) + small soft mouth — never sad, just resting
    return (
      <>
        <path d="M73 96 Q82 102 91 96" stroke="#15152A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M109 96 Q118 102 127 96" stroke="#15152A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M94 115 Q100 119 106 115" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
      </>
    );
  }
  if (mood === 'starstruck') {
    // sparkly star-shaped catchlights + big open smile
    return (
      <>
        <ellipse cx="82" cy="96" rx="11" ry="12.5" fill={`url(#eye-${uid})`} />
        <ellipse cx="118" cy="96" rx="11" ry="12.5" fill={`url(#eye-${uid})`} />
        <Sparkle x={82} y={94} />
        <Sparkle x={118} y={94} />
        <path d="M90 114 Q100 126 110 114 Q100 120 90 114 Z" fill="#FF4D5E" />
      </>
    );
  }
  // neutral / happy
  const smile =
    mood === 'happy'
      ? 'M90 115 Q100 125 110 115' // bigger smile
      : 'M93 116 Q100 121 107 116'; // gentle
  return (
    <>
      <ellipse cx="82" cy="96" rx="11" ry="12.5" fill={`url(#eye-${uid})`} />
      <ellipse cx="118" cy="96" rx="11" ry="12.5" fill={`url(#eye-${uid})`} />
      <circle cx="78.5" cy="91" r="3.6" fill="#fff" />
      <circle cx="114.5" cy="91" r="3.6" fill="#fff" />
      <circle cx="85" cy="99.5" r="1.7" fill="#fff" opacity="0.8" />
      <circle cx="121" cy="99.5" r="1.7" fill="#fff" opacity="0.8" />
      <path d={smile} stroke="#C2410C" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.6" />
    </>
  );
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 5} L${x + 1.4} ${y - 1.4} L${x + 5} ${y} L${x + 1.4} ${y + 1.4} L${x} ${y + 5} L${x - 1.4} ${y + 1.4} L${x - 5} ${y} L${x - 1.4} ${y - 1.4} Z`}
      fill="#fff"
    />
  );
}
