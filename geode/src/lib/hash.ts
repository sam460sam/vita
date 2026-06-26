// ============================================================================
// Fast, dependency-free string hash for caching scan results by image content.
// FNV-1a 32-bit → hex. Not cryptographic; only used as a cache key.
// ============================================================================
export function hashString(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Fold in length to reduce collisions for similar prefixes.
  h ^= input.length;
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Hash a (possibly large) base64 image cheaply by sampling: full length + a
 * stride sample. Avoids hashing megabytes char-by-char while staying stable.
 */
export function hashImage(base64: string, answersKey = ''): string {
  const stride = Math.max(1, Math.floor(base64.length / 4096));
  let sample = '';
  for (let i = 0; i < base64.length; i += stride) sample += base64[i];
  return hashString(`${base64.length}:${sample}:${answersKey}`);
}
