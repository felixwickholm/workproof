const SMALL = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** A count as a greeting reads it: words up to ten, figures after. */
export function spell(n: number): string {
  return SMALL[n] ?? String(n);
}

/** The same, at the start of a sentence. */
export function Spell(n: number): string {
  const word = spell(n);
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** "One proof waits" / "Four proofs wait": noun and verb agree with the count. */
export function counted(n: number, noun: string, verb: { one: string; many: string }): string {
  return `${Spell(n)} ${noun}${n === 1 ? "" : "s"} ${n === 1 ? verb.one : verb.many}`;
}
