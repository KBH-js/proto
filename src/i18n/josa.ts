/**
 * Korean particle (조사) resolution.
 *
 * Locale strings hedge particles after interpolated values as `을(를)` etc.
 * because the right form depends on whether the preceding syllable ends in a
 * final consonant (받침). After interpolation we know the actual character,
 * so this pass picks the correct form — but only when the preceding character
 * is a Hangul syllable. Latin/digit/other endings keep the hedged pair, since
 * their pronunciation (and thus 받침) can't be derived from the code point
 * (e.g. module ids like 'NetworkApp').
 */

/** hedged pattern → [form after 받침, form after open syllable] */
const JOSA_PAIRS: Record<string, [string, string]> = {
  '을(를)': ['을', '를'],
  '이(가)': ['이', '가'],
  '은(는)': ['은', '는'],
  '과(와)': ['과', '와'],
};

const JOSA_RE = /(.)(을\(를\)|이\(가\)|은\(는\)|과\(와\))/g;

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;

function hasBatchim(char: string): boolean | null {
  const code = char.charCodeAt(0);
  if (code < HANGUL_BASE || code > HANGUL_END) return null; // not a Hangul syllable
  return (code - HANGUL_BASE) % 28 > 0;
}

/** Replace hedged particle pairs based on the preceding character. */
export function resolveJosa(text: string): string {
  return text.replace(JOSA_RE, (match, prev: string, pair: string) => {
    const batchim = hasBatchim(prev);
    if (batchim == null) return match; // non-Hangul → keep the hedge
    const [closed, open] = JOSA_PAIRS[pair];
    return prev + (batchim ? closed : open);
  });
}
