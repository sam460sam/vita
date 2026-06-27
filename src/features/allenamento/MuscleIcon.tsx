// Hand-drawn line icons per muscle / movement, so each exercise reads at a
// glance with the right "drawing" (chest, abs, back, legs, calves, yoga…).
// viewBox 24×24, stroke = currentColor, consistent with the app's line icons.

export type MuscleKind =
  | 'chest' | 'back' | 'shoulders' | 'arms' | 'abs'
  | 'legs' | 'calves' | 'glutes' | 'fullbody' | 'cardio' | 'yoga';

// Per-exercise overrides where the muscle group isn't specific enough.
const BY_ID: Record<string, MuscleKind> = {
  calf_raise: 'calves',
  glute_bridge: 'glutes',
  mountain_climber: 'cardio',
  burpee: 'fullbody',
  kb_swing: 'fullbody',
  thruster: 'fullbody',
};
const BY_MUSCLE: Record<string, MuscleKind> = {
  chest: 'chest', back: 'back', shoulders: 'shoulders', arms: 'arms',
  core: 'abs', legs: 'legs', fullbody: 'fullbody',
};

/** Pick the most fitting drawing for an exercise. */
export function iconKindFor(exerciseId: string, muscle: string): MuscleKind {
  return BY_ID[exerciseId] ?? BY_MUSCLE[muscle] ?? 'fullbody';
}

/** A distinct but desaturated (luxury) accent per muscle group. */
export const MUSCLE_COLOR: Record<MuscleKind, string> = {
  chest: '#d98a6a', back: '#6aa3d9', shoulders: '#d9b25a', arms: '#b58ad9',
  abs: '#5ec79b', legs: '#7fc05e', calves: '#9ec05e', glutes: '#d99a6a',
  fullbody: '#d97a9a', cardio: '#d96a6a', yoga: '#8a8ad9',
};

function paths(kind: MuscleKind) {
  switch (kind) {
    case 'chest': // two pectorals
      return <><path d="M11.5 7C7.5 5.8 3 7 3 11c0 3 4 4.2 7 2.4" /><path d="M12.5 7C16.5 5.8 21 7 21 11c0 3-4 4.2-7 2.4" /><path d="M12 7.2v7" /></>;
    case 'abs': // torso with six-pack grid
      return <><rect x="6.5" y="4" width="11" height="16" rx="4" /><path d="M12 5v14M7.5 10h9M7.5 14.5h9" /></>;
    case 'back': // V-taper from behind + spine + lats
      return <><path d="M6 6h12l-2.4 12H8.4L6 6Z" /><path d="M12 6.5v11" /><path d="M8.4 9.5l3 2.6M15.6 9.5l-3 2.6" /></>;
    case 'shoulders': // deltoid cap over arms
      return <><path d="M4 15a8 8 0 0 1 16 0" /><path d="M4 15v3.5M20 15v3.5" /><path d="M9.5 7.2h5" /></>;
    case 'arms': // flexed bicep
      return <><path d="M6.5 21v-6.5c0-2.2 1.7-4 4-4 1.6 0 2.6.7 3.6 1.2L18 8" /><path d="M7.6 13.6c1.6 1.5 4.3 1.5 6 .1" /></>;
    case 'legs': // two legs from the hips
      return <><path d="M8.5 4h7" /><path d="M10 4.3l-1.2 8 .4 7.4M14 4.3l1.2 8-.4 7.4" /></>;
    case 'calves': // shin with a calf bulge
      return <><path d="M12 3.5v17.5" /><path d="M12 9.2c3 .9 3 5.2 0 6.2" /><path d="M12 21h4" /></>;
    case 'glutes': // two rounded glutes
      return <><path d="M12 5.5v7.5" /><circle cx="8.4" cy="13.5" r="4.2" /><circle cx="15.6" cy="13.5" r="4.2" /></>;
    case 'cardio': // heart + pulse = cardio
      return <><path d="M12 20s-6.5-4.2-6.5-8.6A3.6 3.6 0 0 1 12 8.6a3.6 3.6 0 0 1 6.5 2.8C18.5 15.8 12 20 12 20Z" /><path d="M5.5 12.5h2.6l1.4-2.2 1.8 4 1.4-2h2.4" /></>;
    case 'yoga': // seated lotus / meditation
      return <><circle cx="12" cy="5" r="2.2" /><path d="M12 7.4v3.6" /><path d="M5.5 18.5h13L12 11l-6.5 7.5Z" /><path d="M7.5 13.5l4.5 1.8 4.5-1.8" /></>;
    case 'fullbody': // star-jump figure
    default:
      return <><circle cx="12" cy="5" r="2.2" /><path d="M12 7.2v6" /><path d="M12 9l-4-2.5M12 9l4-2.5" /><path d="M12 13.2l-3.2 6.6M12 13.2l3.2 6.6" /></>;
  }
}

export function MuscleIcon({ kind, size = 22, className }: { kind: MuscleKind; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths(kind)}
    </svg>
  );
}
