/**
 * Copies of a text prepared for the guards, so character tricks cannot hide a word:
 * fullwidth letters, zero-width characters, combining marks, Cyrillic or Greek lookalikes,
 * letters spaced out ("y o u n g") and, for the protected lexicon, basic leetspeak ("y0ung").
 * The original text is never changed; only the scan sees these copies.
 */

/** Longer input is cut before scanning, so no pattern ever runs on unbounded text. */
const MAX_SCAN_CHARS = 20_000;

const LOOKALIKES: Record<string, string> = {
  // Cyrillic
  а: "a", в: "b", е: "e", ё: "e", к: "k", м: "m", н: "h", о: "o", р: "p", с: "c", т: "t", у: "y", х: "x",
  і: "i", ї: "i", ј: "j", ѕ: "s", ԁ: "d", ɡ: "g", һ: "h", ӏ: "l", ԛ: "q", ԝ: "w",
  А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", У: "Y", Х: "X", І: "I", Ј: "J", Ѕ: "S",
  // Greek
  α: "a", β: "b", ε: "e", η: "n", ι: "i", κ: "k", ν: "v", ο: "o", ρ: "p", τ: "t", υ: "u", χ: "x", γ: "y",
  Α: "A", Β: "B", Ε: "E", Η: "H", Ι: "I", Κ: "K", Μ: "M", Ν: "N", Ο: "O", Ρ: "P", Τ: "T", Υ: "Y", Χ: "X", Ζ: "Z",
};
const LOOKALIKE_PATTERN = new RegExp(`[${Object.keys(LOOKALIKES).join("")}]`, "gu");

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

/**
 * NFKC, no invisible format characters, no stray combining marks, Latin lookalikes, collapsed spacing.
 * With `keepFirst`, the first letter of a spaced run stays apart, so "a y o u n g" reads "a young".
 */
export function normaliseForScan(text: string, keepFirst = false): string {
  return text
    .slice(0, MAX_SCAN_CHARS)
    .normalize("NFKC")
    .replace(/[\p{Cf}͏ᅟᅠㅤ]/gu, "")
    .replace(/\p{M}/gu, "")
    .replace(LOOKALIKE_PATTERN, (c) => LOOKALIKES[c] ?? c)
    .replace(/[\t ]+/g, " ")
    .replace(/(?<![\p{L}\p{N}])\p{L}(?:[ .·-]\p{L}(?![\p{L}\p{N}])){2,40}/gu, (run) =>
      keepFirst ? `${run[0]} ${run.slice(2).replace(/[ .·-]/g, "")}` : run.replace(/[ .·-]/g, ""),
    );
}

/** Splits identifiers into words: "isMale" -> "is Male", "birth_year" -> "birth year". */
function splitIdentifiers(text: string): string {
  return text.replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2").replace(/_/g, " ");
}

/** Words of four or more characters that mix letters with digits or symbols, read as letters: "y0ung" -> "young". */
function undoLeet(text: string, one: "i" | "l"): string {
  return text.replace(/[\p{L}\p{N}@$]{4,40}/gu, (word) => {
    if (!/\p{L}/u.test(word) || !/[\d@$]/.test(word) || /^\d+$/.test(word)) return word;
    if ((word.match(/\p{L}/gu) ?? []).length < 2) return word;
    return word.replace(/[013457@$]/g, (c) => (c === "1" ? one : LEET[c]));
  });
}

/** Every copy the protected lexicon checks: normalised, with identifiers split, and with leetspeak undone. */
export function protectedScanCopies(text: string): string[] {
  const base = normaliseForScan(text);
  const split = splitIdentifiers(base);
  return [...new Set([base, normaliseForScan(text, true), split, undoLeet(split, "i"), undoLeet(split, "l")])];
}
