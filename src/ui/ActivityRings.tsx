export interface RingData {
  value: number;
  goal: number;
  color: string;
}

interface ActivityRingsProps {
  /** outer -> inner */
  rings: [RingData, RingData, RingData];
  size?: number;
  stroke?: number;
  /** Accessible label (defaults to a neutral English string). */
  ariaLabel?: string;
}

/** Apple-Watch-style concentric activity rings (SVG, animated fill). */
export function ActivityRings({ rings, size = 180, stroke = 16, ariaLabel = 'Activity rings' }: ActivityRingsProps) {
  const gap = 4;
  const center = size / 2;
  return (
    <svg width={size} height={size} className="-rotate-90" role="img" aria-label={ariaLabel}>
      {rings.map((ring, i) => {
        const r = center - stroke / 2 - i * (stroke + gap);
        const c = 2 * Math.PI * r;
        const p = ring.goal > 0 ? Math.max(0, Math.min(1, ring.value / ring.goal)) : 0;
        const offset = c * (1 - p);
        return (
          <g key={i}>
            <circle cx={center} cy={center} r={r} fill="none" stroke={ring.color} strokeOpacity={0.15} strokeWidth={stroke} />
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.32,0.72,0,1)' }}
            />
          </g>
        );
      })}
    </svg>
  );
}
