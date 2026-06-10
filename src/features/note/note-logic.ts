// Pseudo-markdown line parser + content utilities for Notes.
//
// Supported syntax:
//   # heading 1
//   ## heading 2
//   - bullet item
//   [ ] unchecked checkbox
//   [x] checked checkbox
//   #tag  (inline, not a heading)
//   plain text paragraph

export type BlockType = 'h1' | 'h2' | 'bullet' | 'checkbox' | 'paragraph';

export interface Block {
  type: BlockType;
  text: string;        // raw text after the syntax prefix
  checked?: boolean;   // only for 'checkbox'
  lineIndex: number;   // original line index (for checkbox toggle)
}

/** Parse all lines of content into typed blocks. */
export function parseContent(content: string): Block[] {
  return content.split('\n').map((raw, i) => {
    const line = raw;
    if (/^# /.test(line))        return { type: 'h1',       text: line.slice(2).trim(),       lineIndex: i };
    if (/^## /.test(line))       return { type: 'h2',       text: line.slice(3).trim(),       lineIndex: i };
    if (/^- /.test(line))        return { type: 'bullet',   text: line.slice(2).trim(),       lineIndex: i };
    if (/^\[ \] /.test(line))    return { type: 'checkbox', text: line.slice(4).trim(), checked: false, lineIndex: i };
    if (/^\[x\] /i.test(line))  return { type: 'checkbox', text: line.slice(4).trim(), checked: true,  lineIndex: i };
    return { type: 'paragraph', text: line, lineIndex: i };
  });
}

/** Toggle the checkbox at `lineIndex` within `content` and return the new content string. */
export function toggleCheckbox(content: string, lineIndex: number): string {
  const lines = content.split('\n');
  const line = lines[lineIndex] ?? '';
  if (/^\[ \] /.test(line)) {
    lines[lineIndex] = '[x] ' + line.slice(4);
  } else if (/^\[x\] /i.test(line)) {
    lines[lineIndex] = '[ ] ' + line.slice(4);
  }
  return lines.join('\n');
}

/** Extract unique #tags from the entire content string. */
export function extractTags(content: string): string[] {
  const matches = content.match(/#([a-zA-Z0-9_\-àèéìòùÀÈÉÌÒÙ]+)/g) ?? [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}

/**
 * Generate a short readable preview of the content
 * by stripping all markdown prefixes and collapsing whitespace.
 */
export function contentPreview(content: string, maxLen = 120): string {
  const stripped = content
    .split('\n')
    .map((l) => {
      if (/^## /.test(l)) return l.slice(3);
      if (/^# /.test(l)) return l.slice(2);
      if (/^- /.test(l)) return l.slice(2);
      if (/^\[[ x]\] /i.test(l)) return l.slice(4);
      return l;
    })
    .join(' ')
    .replace(/#\w+/g, '')        // strip inline #tags
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > maxLen ? stripped.slice(0, maxLen) + '…' : stripped;
}

/**
 * Return a display title: first H1 line, or first non-empty line (stripped),
 * or the fallback string.
 */
export function autoTitle(content: string, fallback = 'Nota senza titolo'): string {
  const lines = content.split('\n');
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    if (/^# /.test(t)) return t.slice(2).trim();
    // strip other prefixes
    const cleaned = t
      .replace(/^## /, '')
      .replace(/^- /, '')
      .replace(/^\[[ x]\] /i, '')
      .trim();
    if (cleaned) return cleaned;
  }
  return fallback;
}

/** Format a note date (yyyy-MM-dd) into a human-friendly Italian string. */
export function formatNoteDate(date: string | undefined): string {
  if (!date) return '';
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (date === today)     return 'Oggi';
  if (date === yesterday) return 'Ieri';
  return new Date(date + 'T00:00:00').toLocaleDateString('it-IT', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** Toolbar actions that insert syntax at the cursor position in a textarea. */
export function insertAtCursor(
  el: HTMLTextAreaElement,
  prefix: string,
  suffix = '',
  placeholder = '',
): string {
  const { selectionStart: s, selectionEnd: e, value } = el;
  const selected = value.slice(s, e) || placeholder;
  const before = value.slice(0, s);
  const after = value.slice(e);
  return before + prefix + selected + suffix + after;
}

/** Wrap the current line (by cursor position) with a line prefix. */
export function wrapLine(
  el: HTMLTextAreaElement,
  linePrefix: string,
): { newValue: string; newCursorPos: number } {
  const { selectionStart: s, value } = el;
  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  const lineEnd = value.indexOf('\n', s);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const line = value.slice(lineStart, end);

  // If line already starts with this prefix, remove it (toggle)
  let newLine: string;
  if (line.startsWith(linePrefix)) {
    newLine = line.slice(linePrefix.length);
  } else {
    // Remove any other known prefix first
    const stripped = line
      .replace(/^# /, '')
      .replace(/^## /, '')
      .replace(/^- /, '')
      .replace(/^\[[ x]\] /i, '');
    newLine = linePrefix + stripped;
  }

  const newValue = value.slice(0, lineStart) + newLine + value.slice(end);
  const delta = newLine.length - line.length;
  return { newValue, newCursorPos: s + delta };
}
