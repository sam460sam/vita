import { cn } from '@/lib/cn';

type Mood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

/**
 * Vita's mascot — a cute waving panda, bold-outline cartoon style.
 * Pure SVG. Keeps the StarMascot name + `mood` API so call sites don't change.
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
  mood?: Mood;
}) {
  const O = '#1A1A1A'; // outline / black fur
  const W = '#FFFFFF'; // white fur
  const CHEEK = '#D9A7B0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-stella-float', className)}
      role="img"
      aria-label="Panda"
    >
      <ellipse cx="100" cy="206" rx="40" ry="6" fill="#000" opacity="0.06" />

      {/* raised left arm (waving) */}
      <path d="M70 120 Q40 96 44 74 Q47 62 60 68 Q78 86 86 116 Z" fill={O} stroke={O} strokeWidth="4" strokeLinejoin="round" />

      {/* body (white belly + black sides) */}
      <path d="M62 150 Q58 196 100 198 Q142 196 138 150 Q134 120 100 120 Q66 120 62 150 Z" fill={O} stroke={O} strokeWidth="5" strokeLinejoin="round" />
      <path d="M78 152 Q76 188 100 190 Q124 188 122 152 Q118 132 100 132 Q82 132 78 152 Z" fill={W} />

      {/* legs */}
      <ellipse cx="82" cy="194" rx="14" ry="11" fill={O} />
      <ellipse cx="118" cy="194" rx="14" ry="11" fill={O} />

      {/* right arm down */}
      <path d="M138 140 Q160 138 158 162 Q156 178 138 172 Z" fill={O} stroke={O} strokeWidth="4" strokeLinejoin="round" />

      {/* head */}
      <g stroke={O} strokeWidth="5" strokeLinejoin="round">
        {/* ears */}
        <circle cx="58" cy="58" r="22" fill={O} />
        <circle cx="142" cy="58" r="22" fill={O} />
        {/* face */}
        <ellipse cx="100" cy="78" rx="62" ry="54" fill={W} />
      </g>

      <Face mood={mood} O={O} cheek={CHEEK} />
    </svg>
  );
}

function Face({ mood, O, cheek }: { mood: Mood; O: string; cheek: string }) {
  const cheeks = (
    <>
      <ellipse cx="60" cy="92" rx="12" ry="8" fill={cheek} opacity={mood === 'happy' || mood === 'starstruck' ? 0.85 : 0.5} />
      <ellipse cx="140" cy="92" rx="12" ry="8" fill={cheek} opacity={mood === 'happy' || mood === 'starstruck' ? 0.85 : 0.5} />
    </>
  );
  // black eye patches (the panda signature)
  const patches = (
    <>
      <ellipse cx="76" cy="74" rx="15" ry="19" transform="rotate(-18 76 74)" fill={O} />
      <ellipse cx="124" cy="74" rx="15" ry="19" transform="rotate(18 124 74)" fill={O} />
    </>
  );
  // nose + mouth
  const muzzle = (
    <>
      <path d="M100 92 q7 0 7 6 q0 5 -7 6 q-7 -1 -7 -6 q0 -6 7 -6 Z" fill={O} />
      <path d="M100 104 v5 M100 109 q-7 6 -13 2 M100 109 q7 6 13 2" stroke={O} strokeWidth="3" strokeLinecap="round" fill="none" />
    </>
  );

  if (mood === 'sleepy') {
    return (
      <>
        {patches}
        {cheeks}
        <path d="M70 78 q7 5 13 0" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M117 78 q7 5 13 0" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {muzzle}
      </>
    );
  }

  const r = mood === 'starstruck' ? 8 : 7;
  return (
    <>
      {patches}
      {cheeks}
      <circle cx="78" cy="76" r={r} fill="#fff" />
      <circle cx="122" cy="76" r={r} fill="#fff" />
      {mood === 'starstruck' ? (
        <>
          <Sparkle x={78} y={75} />
          <Sparkle x={122} y={75} />
        </>
      ) : (
        <>
          <circle cx="80" cy="78" r="3.2" fill={O} />
          <circle cx="124" cy="78" r="3.2" fill={O} />
        </>
      )}
      {muzzle}
    </>
  );
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 5} L${x + 1.5} ${y - 1.5} L${x + 5} ${y} L${x + 1.5} ${y + 1.5} L${x} ${y + 5} L${x - 1.5} ${y + 1.5} L${x - 5} ${y} L${x - 1.5} ${y - 1.5} Z`}
      fill="#1A1A1A"
    />
  );
}
