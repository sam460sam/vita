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

/**
 * Premium credit-card style palette — muted, metallic, sophisticated tones.
 * Categories are mapped to these by order so the chart always looks elegant
 * regardless of the raw category accent colors.
 */
const PREMIUM = [
  '#1F2A44', // navy
  '#B8860B', // antique gold
  '#0F5132', // deep emerald
  '#6B7280', // graphite
  '#7C3AED', // amethyst
  '#9A3412', // bronze/burgundy
  '#0E7490', // teal
  '#A16207', // dark amber
  '#4B5563', // steel
  '#155E75', // petrol
  '#5B21B6', // royal purple
  '#92400E', // copper
];
const INCOME = '#0F5132'; // deep emerald for the income node

function premiumColor(i: number): string {
  return PREMIUM[i % PREMIUM.length];
}

/** Lighten a hex color toward white by t (0..1) for the gradient sheen. */
function lighten(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (c: number) => Math.round(c + (255 - c) * t);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

/**
 * Money-flow Sankey, premium edition: solid metallic ribbons with a subtle
 * vertical sheen and a full crisp border, getquin-style layout.
 */
export function Sankey({ sourceLabel, sourceValue, flows, height = 320, format = (n) => String(n) }: SankeyProps) {
  const uid = useId().replace(/:/g, '');
  const W = 360;
  const H = height;
  const gap = 8;
  const nodeW = 9;
  const leftX = 0;
  const rightX = W - nodeW;
  const ribbonStart = leftX + nodeW;
  const ribbonEnd = rightX;

  const total = flows.reduce((s, f) => s + f.value, 0) || 1;
  const usableH = H - gap * (flows.length - 1);

  let lc = 0;
  let rc = 0;
  const segments = flows.map((f, i) => {
    const h = (f.value / total) * usableH;
    const color = premiumColor(i);
    const seg = { ...f, color, ly: lc, ry: rc, h };
    lc += h;
    rc += h + gap;
    return seg;
  });
  const sourceH = lc;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet">
      <defs>
        {segments.map((s, i) => (
          <linearGradient key={i} id={`sk-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(s.color, 0.28)} />
            <stop offset="55%" stopColor={s.color} />
            <stop offset="100%" stopColor={s.color} />
          </linearGradient>
        ))}
        <linearGradient id={`sk-src-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(INCOME, 0.3)} />
          <stop offset="100%" stopColor={INCOME} />
        </linearGradient>
      </defs>

      {/* ribbons: solid metallic fill + full border */}
      {segments.map((s, i) => {
        const l0 = s.ly;
        const l1 = s.ly + s.h;
        const r0 = s.ry;
        const r1 = s.ry + s.h;
        const c1 = ribbonStart + (ribbonEnd - ribbonStart) * 0.5;
        const c2 = ribbonStart + (ribbonEnd - ribbonStart) * 0.5;
        const d = `M ${ribbonStart} ${l0}
                   C ${c1} ${l0}, ${c2} ${r0}, ${ribbonEnd} ${r0}
                   L ${ribbonEnd} ${r1}
                   C ${c2} ${r1}, ${c1} ${l1}, ${ribbonStart} ${l1} Z`;
        return (
          <path
            key={i}
            d={d}
            fill={`url(#sk-${uid}-${i})`}
            stroke={lighten(s.color, 0.45)}
            strokeWidth="1"
            strokeOpacity="0.9"
          />
        );
      })}

      {/* income source node */}
      <rect x={leftX} y={0} width={nodeW} height={sourceH} rx={3} fill={`url(#sk-src-${uid})`} stroke={lighten(INCOME, 0.4)} strokeWidth="1" />

      {/* target nodes + labels */}
      {segments.map((s, i) => (
        <g key={i}>
          <rect x={rightX} y={s.ry} width={nodeW} height={Math.max(2, s.h)} rx={3} fill={s.color} stroke={lighten(s.color, 0.45)} strokeWidth="1" />
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
