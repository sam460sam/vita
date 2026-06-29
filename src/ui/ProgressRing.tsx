import { useId } from 'react';

interface ProgressRingProps {
  /** 0..1 (can exceed 1; visually clamps the arc at 1 turn) */
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  /** Optional two-stop gradient for the arc — overrides `color` when set. */
  gradient?: [string, string];
  trackColor?: string;
  children?: React.ReactNode;
}

/** Single circular progress ring (SVG, fluid). */
export function ProgressRing({
  progress,
  size = 64,
  stroke = 8,
  color = 'var(--c-project)',
  gradient,
  trackColor = 'var(--c-divider)',
  children,
}: ProgressRingProps) {
  const gid = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  const offset = c * (1 - p);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {gradient && (
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={gradient ? `url(#${gid})` : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.32,0.72,0,1)' }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}
