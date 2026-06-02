import { cn } from '@/lib/cn';

type Mood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

/**
 * Vita's mascot — a cute panda standing and waving one arm, matching the
 * reference: white body, black ears/arms/legs, black eye-patches with white
 * eyes, rosy cheeks, tiny smile. Pure SVG, bold black outline.
 * Keeps the StarMascot name + `mood` API so call sites don't change.
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
  const K = '#111111'; // black fur / outline
  const W = '#FFFFFF';
  const CHEEK = '#C9CAD2';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-stella-float', className)}
      role="img"
      aria-label="Panda"
    >
      <ellipse cx="100" cy="226" rx="46" ry="7" fill="#000" opacity="0.06" />

      {/* ===== BODY (drawn before head) ===== */}
      {/* raised left arm waving (panda's right) */}
      <path
        d="M70 150 Q40 120 36 96 Q34 84 46 84 Q58 86 64 104 Q72 128 84 146 Z"
        fill={K} stroke={K} strokeWidth="3" strokeLinejoin="round"
      />
      {/* white belly torso */}
      <path
        d="M64 168 Q60 214 100 216 Q140 214 136 168 Q132 138 100 138 Q68 138 64 168 Z"
        fill={W} stroke={K} strokeWidth="4.5" strokeLinejoin="round"
      />
      {/* right arm down along the side (black) */}
      <path
        d="M132 150 Q156 150 156 178 Q156 196 138 192 Q126 188 124 168 Z"
        fill={K} stroke={K} strokeWidth="3" strokeLinejoin="round"
      />
      {/* legs (black) */}
      <path d="M78 206 Q70 222 84 224 Q98 224 96 208 Z" fill={K} stroke={K} strokeWidth="3" strokeLinejoin="round" />
      <path d="M122 206 Q130 222 116 224 Q102 224 104 208 Z" fill={K} stroke={K} strokeWidth="3" strokeLinejoin="round" />

      {/* ===== HEAD ===== */}
      {/* ears */}
      <circle cx="58" cy="56" r="24" fill={K} />
      <circle cx="142" cy="56" r="24" fill={K} />
      {/* face */}
      <ellipse cx="100" cy="80" rx="64" ry="56" fill={W} stroke={K} strokeWidth="4.5" />

      <Face mood={mood} K={K} cheek={CHEEK} />
    </svg>
  );
}

function Face({ mood, K, cheek }: { mood: Mood; K: string; cheek: string }) {
  // black eye patches (teardrop, angled inward) — the panda signature
  const patches = (
    <>
      <ellipse cx="74" cy="80" rx="16" ry="21" transform="rotate(-20 74 80)" fill={K} />
      <ellipse cx="126" cy="80" rx="16" ry="21" transform="rotate(20 126 80)" fill={K} />
    </>
  );
  const cheeks = (
    <>
      <ellipse cx="58" cy="98" rx="11" ry="7" fill={cheek} opacity={mood === 'happy' || mood === 'starstruck' ? 0.9 : 0.55} />
      <ellipse cx="142" cy="98" rx="11" ry="7" fill={cheek} opacity={mood === 'happy' || mood === 'starstruck' ? 0.9 : 0.55} />
    </>
  );
  // small nose + tiny "w" smile (like the reference)
  const muzzle = (
    <>
      <path d="M100 96 q6 0 6 5 q0 4 -6 5 q-6 -1 -6 -5 q0 -5 6 -5 Z" fill={K} />
      <path d="M100 106 v4 M100 110 q-6 5 -11 1 M100 110 q6 5 11 1" stroke={K} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </>
  );

  if (mood === 'sleepy') {
    return (
      <>
        {patches}
        {cheeks}
        <path d="M68 82 q7 5 13 0" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M119 82 q7 5 13 0" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        {muzzle}
      </>
    );
  }

  const r = mood === 'starstruck' ? 9 : 8;
  return (
    <>
      {patches}
      {cheeks}
      {/* white eyeballs inside the patches */}
      <circle cx="78" cy="82" r={r} fill="#fff" />
      <circle cx="122" cy="82" r={r} fill="#fff" />
      {mood === 'starstruck' ? (
        <>
          <Sparkle x={78} y={81} />
          <Sparkle x={122} y={81} />
        </>
      ) : (
        <>
          <circle cx="80" cy="84" r="3.4" fill={K} />
          <circle cx="124" cy="84" r="3.4" fill={K} />
          <circle cx="76" cy="79" r="1.8" fill="#fff" />
          <circle cx="120" cy="79" r="1.8" fill="#fff" />
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
      fill="#111111"
    />
  );
}
