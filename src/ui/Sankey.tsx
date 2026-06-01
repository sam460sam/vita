import { useId } from 'react';

export interface SankeyFlow {
  label: string;
  value: number;
  color: string;
}

interface SankeyProps {
  sourceLabel: string;
  sourceValue: number;
  flows: SankeyFlow[];
  height?: number;
  format?: (n: number) => string;
}

const INCOME = '#22C55E';

/**
 * Money-flow Sankey (getquin-style): one income node on the left fans out into
 * category ribbons on the right. Each ribbon is a smooth bezier that blends
 * from the income green to the category color, with a soft glossy highlight.
 */
export function Sankey({ sourceLabel, sourceValue, flows, height = 320, format = (n) => String(n) }: SankeyProps) {
  const uid = useId().replace(/:/g, '');
  const W = 360;
  const H = height;
  const gap = 7;
  const nodeW = 9;
  const leftX = 0;
  const rightX = W - nodeW;
  const ribbonStart = leftX + nodeW;
  const ribbonEnd = rightX;

  const total = flows.reduce((s, f) => s + f.value, 0) || 1;
  const usableH = H - gap * (flows.length - 1);

  // Left side is stacked tightly (full source bar); right side keeps the gaps.
  let lc = 0;
  let rc = 0;
  const segments = flows.map((f) => {
    const h = (f.value / total) * usableH;
    const seg = { ...f, ly: lc, ry: rc, h };
    lc += h; // left: no gap → solid source bar
    rc += h + gap; // right: spaced
    return seg;
  });
  const sourceH = lc;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
      <defs>
        {segments.map((s, i) => (
          <linearGradient key={i} id={`sk-${uid}-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={INCOME} stopOpacity="0.85" />
            <stop offset="45%" stopColor={INCOME} stopOpacity="0.5" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.95" />
          </linearGradient>
        ))}
        {/* soft top highlight for a glossy ribbon feel */}
        <linearGradient id={`sk-gloss-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`sk-glow-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* ribbons */}
      {segments.map((s, i) => {
        const l0 = s.ly;
        const l1 = s.ly + s.h;
        const r0 = s.ry;
        const r1 = s.ry + s.h;
        // control points create a smooth S-curve
        const c1 = ribbonStart + (ribbonEnd - ribbonStart) * 0.45;
        const c2 = ribbonStart + (ribbonEnd - ribbonStart) * 0.55;
        const d = `M ${ribbonStart} ${l0}
                   C ${c1} ${l0}, ${c2} ${r0}, ${ribbonEnd} ${r0}
                   L ${ribbonEnd} ${r1}
                   C ${c2} ${r1}, ${c1} ${l1}, ${ribbonStart} ${l1} Z`;
        return (
          <g key={i}>
            <path d={d} fill={`url(#sk-${uid}-${i})`} filter={`url(#sk-glow-${uid})`} />
            <path d={d} fill={`url(#sk-gloss-${uid})`} />
          </g>
        );
      })}

      {/* income source node */}
      <rect x={leftX} y={0} width={nodeW} height={sourceH} rx={3} fill={INCOME} />

      {/* target nodes + labels */}
      {segments.map((s, i) => (
        <g key={i}>
          <rect x={rightX} y={s.ry} width={nodeW} height={Math.max(2, s.h)} rx={3} fill={s.color} />
          {s.h >= 13 && (
            <text x={rightX - 7} y={s.ry + s.h / 2 + 3.5} textAnchor="end" fontSize="10.5">
              <tspan fontWeight="700" fill="var(--c-ink)">{s.label}</tspan>
              <tspan dx="6" fill="var(--c-ink-2)">{format(s.value)}</tspan>
            </text>
          )}
        </g>
      ))}

      {/* source label */}
      <text x={leftX + nodeW + 7} y={13} fontSize="10.5" fill="var(--c-ink)" fontWeight="700">
        {sourceLabel}
      </text>
      <text x={leftX + nodeW + 7} y={26} fontSize="10" fill="var(--c-ink-2)">
        {format(sourceValue)}
      </text>
    </svg>
  );
}
