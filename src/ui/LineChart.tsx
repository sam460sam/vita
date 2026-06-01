interface LineChartProps {
  points: { x: number; y: number }[]; // x = epoch ms, y = value
  goal?: number;
  color?: string;
  height?: number;
  /** show Y-axis gridlines + labels (smart/tech look) */
  axis?: boolean;
  unit?: string;
}

/** Minimal SVG line chart with optional Y grid, dashed goal line and end marker. */
export function LineChart({ points, goal, color = 'var(--c-ink)', height = 200, axis = false, unit }: LineChartProps) {
  if (points.length === 0) return <div style={{ height }} />;

  const W = 320;
  const H = height;
  const padL = axis ? 30 : 8;
  const padR = 10;
  const padY = 16;

  const xs = points.map((p) => p.x);
  const ysRaw = points.map((p) => p.y);
  const allY = goal != null ? [...ysRaw, goal] : ysRaw;
  let minY = Math.min(...allY);
  let maxY = Math.max(...allY);
  if (minY === maxY) {
    minY -= 2;
    maxY += 2;
  } else {
    const pad = (maxY - minY) * 0.2;
    minY -= pad;
    maxY += pad;
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const spanX = maxX - minX || 1;

  const sx = (x: number) => padL + ((x - minX) / spanX) * (W - padL - padR);
  const sy = (y: number) => padY + (1 - (y - minY) / (maxY - minY)) * (H - padY * 2);

  // Build ~4 gridline ticks at "nice" values.
  const ticks: number[] = [];
  if (axis) {
    const steps = 4;
    for (let i = 0; i <= steps; i++) ticks.push(minY + ((maxY - minY) * i) / steps);
  }

  const last = points[points.length - 1];
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${sx(last.x).toFixed(1)} ${H - padY} L ${sx(points[0].x).toFixed(1)} ${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines + labels */}
      {axis &&
        ticks.map((tv, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={sy(tv)} y2={sy(tv)} stroke="var(--c-divider)" strokeWidth="1" />
            <text x={padL - 6} y={sy(tv) + 3} textAnchor="end" fontSize="9" fill="var(--c-ink-3)">
              {Math.round(tv)}
            </text>
          </g>
        ))}

      {goal != null && (
        <line x1={padL} x2={W - padR} y1={sy(goal)} y2={sy(goal)} stroke="var(--c-habit)" strokeWidth="1.5" strokeDasharray="4 4" />
      )}
      <path d={areaPath} fill="url(#lc-fill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.length <= 40 && points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="2.4" fill={color} />)}

      {/* end marker (current value) */}
      <circle cx={sx(last.x)} cy={sy(last.y)} r="5" fill={color} stroke="var(--c-card)" strokeWidth="2.5" />
      {unit && (
        <text x={Math.min(sx(last.x), W - padR - 2)} y={sy(last.y) - 9} textAnchor="end" fontSize="10" fontWeight="700" fill={color}>
          {Math.round(last.y * 10) / 10}
        </text>
      )}
    </svg>
  );
}
