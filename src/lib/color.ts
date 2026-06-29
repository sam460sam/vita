// ============================================================================
// Tiny color helpers for the candy/pastel layer. Pure presentation — derives
// soft tints from a base color without changing any stored data.
// ============================================================================

/** Parse a #rgb / #rrggbb string into [r,g,b]. Falls back to a neutral grey. */
function parseHex(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = Number.parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [148, 148, 152];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** rgba() string from a hex color + alpha. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** A very soft, desaturated wash of a color — used for card backgrounds. */
export function tint(hex: string): string {
  return alpha(hex, 0.12);
}

/** A slightly stronger wash — used for the icon chip container. */
export function chipTint(hex: string): string {
  return alpha(hex, 0.2);
}
