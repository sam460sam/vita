// Tiny deterministic NLP helpers for the offline Mock provider. Not a real
// parser — just enough to turn dictation like "four hundred square feet of
// pavers" into believable, editable draft lines without any network.
const SMALL: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const MAG: Record<string, number> = { hundred: 100, thousand: 1000 };

/** Parse a run of number words ("four hundred fifty") into a number. */
export function wordsToNumber(tokens: string[]): number | null {
  let total = 0;
  let current = 0;
  let used = false;
  for (const tok of tokens) {
    if (tok in SMALL) {
      current += SMALL[tok];
      used = true;
    } else if (tok in MAG) {
      current = (current || 1) * MAG[tok];
      if (MAG[tok] >= 1000) {
        total += current;
        current = 0;
      }
      used = true;
    } else break;
  }
  return used ? total + current : null;
}

/** First number in a phrase, digit ("400") or words ("four hundred"). */
export function extractNumber(phrase: string): number | null {
  const digit = phrase.match(/\d+(\.\d+)?/);
  if (digit) return Number(digit[0]);
  const toks = phrase.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (let i = 0; i < toks.length; i++) {
    if (toks[i] in SMALL || toks[i] in MAG) return wordsToNumber(toks.slice(i));
  }
  return null;
}

/** Split a transcript into clause-like segments on commas / "and" / "then". */
export function segments(transcript: string): string[] {
  return transcript
    .split(/,|\band\b|\bthen\b|;|\./i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}
