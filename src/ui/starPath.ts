// Generates a smooth, symmetric rounded 5-point star path — shared by the
// in-app mascot and the icon generator so they look identical.
export function roundedStarPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points = 5,
  round = 0.32,
  rotation = -Math.PI / 2, // first point straight up
): string {
  const verts: { x: number; y: number }[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + i * step;
    verts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  // Round every corner with a quadratic curve through the vertex.
  const n = verts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const cur = verts[i];
    const next = verts[(i + 1) % n];
    const a = { x: cur.x + (prev.x - cur.x) * round, y: cur.y + (prev.y - cur.y) * round };
    const b = { x: cur.x + (next.x - cur.x) * round, y: cur.y + (next.y - cur.y) * round };
    if (i === 0) d += `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} `;
    else d += `L ${a.x.toFixed(2)} ${a.y.toFixed(2)} `;
    d += `Q ${cur.x.toFixed(2)} ${cur.y.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)} `;
  }
  return d + 'Z';
}
