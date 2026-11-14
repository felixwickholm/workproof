const WORD = "[\\p{L}\\p{N}_]";
const BOUNDARY = `(?:(?<=${WORD})(?!${WORD})|(?<!${WORD})(?=${WORD}))`;
const cache = new Map<string, RegExp>();

/**
 * The same pattern with Unicode-aware word edges. JavaScript's `\b` only knows ASCII letters,
 * so "neljä" or "äidinkieli" would otherwise lose or gain an edge next to ä, ö or å.
 */
export function unicodeWords(pattern: RegExp): RegExp {
  const key = `${pattern.flags}/${pattern.source}`;
  let converted = cache.get(key);
  if (!converted) {
    const flags = pattern.flags.includes("u") ? pattern.flags : `${pattern.flags}u`;
    converted = new RegExp(pattern.source.replace(/(?<!\\)((?:\\\\)*)\\b/g, `$1${BOUNDARY}`), flags);
    cache.set(key, converted);
  }
  converted.lastIndex = 0;
  return converted;
}
