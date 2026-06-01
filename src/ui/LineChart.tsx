interface LineChartProps {
  points: { x: number; y: number }[]; // x = epoch ms, y = value
  goal?: number;
  color?: string;
  height?: number;
}

/** Minimal SVG line chart with a dashed goal line. No dependencies. */
export function LineChart({ points, goal, color = 'var(--c-ink)', height = 180 }: LineChartProps) {
  if (points.length === 0) return <div style={{ height }} />;

  const W = 320;
  const H = height;
  const padX = 8;
  const padY = 16;

  const xs = points.map((p) => p.x);
  const ysRaw = points.map((p) => p.y);
  const allY = goal != null ? [...ysRaw, goal] : ysRaw;
  let minY = Math.min(...allY);
  let maxY = Math.max(...allY);
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  } else {
    const pad = (maxY - minY) * 0.15;
    minY -= pad;
    maxY += pad;
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const spanX = maxX - minX || 1;

  const sx = (x: number) => padX + ((x - minX) / spanX) * (W - padX * 2);
  const sy = (y: number) => padY + (1 - (y - minY) / (maxY - minY)) * (H - padY * 2);

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${sx(points[points.length - 1].x).toFixed(1)} ${H - padY} L ${sx(points[0].x).toFixed(1)} ${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {goal != null && (
        <line
          x1={padX}
          x2={W - padX}
          y1={sy(goal)}
          y2={sy(goal)}
          stroke="var(--c-habit)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      )}
      <path d={areaPath} fill="url(#lc-fill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.length <= 30 &&
        points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="2.6" fill={color} />)}
    </svg>
  );
}
