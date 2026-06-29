// Warm note palette — hex values so we can derive translucent card washes
// (`${color}1f`) that work in both light and dark themes.
export interface NoteColor {
  key: string;
  value: string;
}

export const NOTE_COLORS: NoteColor[] = [
  { key: 'honey', value: '#e0992f' },
  { key: 'coral', value: '#ff6b57' },
  { key: 'rose', value: '#ec4899' },
  { key: 'mint', value: '#10b981' },
  { key: 'sky', value: '#3b82f6' },
  { key: 'lavender', value: '#8b5cf6' },
];

export const DEFAULT_NOTE_COLOR = NOTE_COLORS[0].value;

/** Translucent wash of a note color for card backgrounds. */
export function noteTint(color: string): string {
  return `${color}1f`;
}
