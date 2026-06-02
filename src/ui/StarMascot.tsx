import { useId } from 'react';
import { cn } from '@/lib/cn';

type Mood = 'sleepy' | 'neutral' | 'happy' | 'starstruck';

/**
 * Vita's mascot — a friendly koala (replaces the earlier star). Pure SVG so it
 * stays crisp at any size. Keeps the StarMascot name + `mood` API so existing
 * call sites don't change.
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
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-stella-float', className)}
      role="img"
      aria-label="Koala"
    >
      <defs>
        <radialGradient id={`fur-${uid}`} cx="42%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#C7CDD4" />
          <stop offset="60%" stopColor="#A8B0B9" />
          <stop offset="100%" stopColor="#8C949E" />
        </radialGradient>
        <radialGradient id={`ear-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#C7CDD4" />
          <stop offset="100%" stopColor="#9AA2AC" />
        </radialGradient>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="100" cy="182" rx="40" ry="7" fill="#000" opacity="0.06" />

      {/* ears */}
      <circle cx="55" cy="70" r="30" fill={`url(#ear-${uid})`} />
      <circle cx="145" cy="70" r="30" fill={`url(#ear-${uid})`} />
      <circle cx="55" cy="70" r="17" fill="#F4B8C4" opacity="0.8" />
      <circle cx="145" cy="70" r="17" fill="#F4B8C4" opacity="0.8" />
      {/* inner ear fur */}
      <circle cx="55" cy="70" r="17" fill="none" stroke="#C7CDD4" strokeWidth="3" opacity="0.5" />
      <circle cx="145" cy="70" r="17" fill="none" stroke="#C7CDD4" strokeWidth="3" opacity="0.5" />

      {/* head */}
      <ellipse cx="100" cy="106" rx="62" ry="56" fill={`url(#fur-${uid})`} />
      {/* cheek fluff hint */}
      <ellipse cx="46" cy="118" rx="14" ry="18" fill="#C7CDD4" opacity="0.5" />
      <ellipse cx="154" cy="118" rx="14" ry="18" fill="#C7CDD4" opacity="0.5" />

      {/* rosy cheeks */}
      <ellipse cx="58" cy="124" rx="13" ry="8" fill="#FF8FA3" opacity={mood === 'happy' || mood === 'starstruck' ? 0.6 : 0.35} />
      <ellipse cx="142" cy="124" rx="13" ry="8" fill="#FF8FA3" opacity={mood === 'happy' || mood === 'starstruck' ? 0.6 : 0.35} />

      <Face uid={uid} mood={mood} />
    </svg>
  );
}

function Face({ uid, mood }: { uid: string; mood: Mood }) {
  void uid;
  // big soft nose — the koala signature
  const nose = (
    <path d="M100 108 q22 4 22 18 q0 16 -22 18 q-22 -2 -22 -18 q0 -14 22 -18 Z" fill="#3A3A44" />
  );
  const noseGloss = <ellipse cx="92" cy="118" rx="5" ry="3.5" fill="#fff" opacity="0.25" />;

  if (mood === 'sleepy') {
    return (
      <>
        <path d="M62 98 q12 8 24 0" stroke="#3A3A44" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M114 98 q12 8 24 0" stroke="#3A3A44" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {nose}
        {noseGloss}
        <path d="M88 150 q12 7 24 0" stroke="#3A3A44" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      </>
    );
  }

  const eyeR = mood === 'starstruck' ? 9 : 8;
  return (
    <>
      <circle cx="74" cy="98" r={eyeR} fill="#2A2A33" />
      <circle cx="126" cy="98" r={eyeR} fill="#2A2A33" />
      {mood === 'starstruck' ? (
        <>
          <Sparkle x={74} y={96} />
          <Sparkle x={126} y={96} />
        </>
      ) : (
        <>
          <circle cx="71" cy="94.5" r="2.6" fill="#fff" />
          <circle cx="123" cy="94.5" r="2.6" fill="#fff" />
        </>
      )}
      {nose}
      {noseGloss}
      {/* smile under the nose */}
      <path
        d={mood === 'happy' || mood === 'starstruck' ? 'M84 150 q16 12 32 0' : 'M90 150 q10 6 20 0'}
        stroke="#3A3A44"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    </>
  );
}

function Sparkle({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 6} L${x + 1.7} ${y - 1.7} L${x + 6} ${y} L${x + 1.7} ${y + 1.7} L${x} ${y + 6} L${x - 1.7} ${y + 1.7} L${x - 6} ${y} L${x - 1.7} ${y - 1.7} Z`}
      fill="#fff"
    />
  );
}
