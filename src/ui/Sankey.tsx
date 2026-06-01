import { useId } from 'react';

export interface SankeyFlow {
  label: string;
  value: number;
  color: string;
}

interface SankeyProps {
  /** left node (total income) */
  sourceLabel: string;
  sourceValue: number;
  /** right nodes (where the money goes) */
  flows: SankeyFlow[];
  height?: number;
  format?: (n: number) => string;
}

/**
 * Money-flow Sankey: one income node on the left fans out into category flows
 * on the right, with curved ribbons proportional to amount. Pure SVG.
 */
export function Sankey({ sourceLabel, sourceValue, flows, height = 320, format = (n) => String(n) }: SankeyProps) {
  const uid = useId().replace(/:/g, '');
  const W = 360;
  const H = height;
  const gap = 6; // vertical gap between flows
  const nodeW = 10;
  const leftX = 0;
  const rightX = W - nodeW;
  const ribbonStart = leftX + nodeW;
  const ribbonEnd = rightX;

  const total = flows.reduce((s, f) => s + f.value, 0) || 1;
  const usableH = H - gap * (flows.length - 1);

  // Source node spans the full height of the summed flows.
  let cursor = 0;
  const segments = flows.map((f) => {
    const h = (f.value / total) * usableH;
    const seg = { ...f, y: cursor, h };
    cursor += h + gap;
    return seg;
  });
  const sourceH = cursor - gap;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
      <defs>
        {segments.map((s, i) => (
          <linearGradient key={i} id={`sk-${uid}-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.9" />
          </linearGradient>
        ))}
      </defs>

      {/* ribbons */}
      {segments.map((s, i) => {
        const y0 = s.y;
        const y1 = s.y + s.h;
        const ty = s.y;
        const tyb = s.y + s.h;
        const midX = (ribbonStart + ribbonEnd) / 2;
        const d = `M ${ribbonStart} ${y0}
                   C ${midX} ${y0}, ${midX} ${ty}, ${ribbonEnd} ${ty}
                   L ${ribbonEnd} ${tyb}
                   C ${midX} ${tyb}, ${midX} ${y1}, ${ribbonStart} ${y1} Z`;
        return <path key={i} d={d} fill={`url(#sk-${uid}-${i})`} />;
      })}

      {/* source node */}
      <rect x={leftX} y={0} width={nodeW} height={sourceH} rx={3} fill="#22C55E" />

      {/* target nodes + labels */}
      {segments.map((s, i) => (
        <g key={i}>
          <rect x={rightX} y={s.y} width={nodeW} height={Math.max(2, s.h)} rx={3} fill={s.color} />
          {s.h >= 14 && (
            <text x={rightX - 6} y={s.y + s.h / 2 + 3} textAnchor="end" fontSize="10" fill="var(--c-ink-2)">
              <tspan fontWeight="600" fill="var(--c-ink)">{s.label}</tspan>
              <tspan dx="6">{format(s.value)}</tspan>
            </text>
          )}
        </g>
      ))}

      {/* source label (vertical, on the left node) */}
      <text x={leftX + nodeW + 6} y={14} fontSize="10" fill="var(--c-ink)" fontWeight="700">
        {sourceLabel}
      </text>
      <text x={leftX + nodeW + 6} y={27} fontSize="10" fill="var(--c-ink-2)">
        {format(sourceValue)}
      </text>
    </svg>
  );
}
