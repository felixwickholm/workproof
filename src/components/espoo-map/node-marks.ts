/** Letters only, so a space or a hyphen never becomes part of a mark. */
const LETTER = /\p{L}/u;

/**
 * The letters drawn on each company's node, keyed by company id. A company whose first letter
 * no other company shares gets that letter alone; companies that share one get two letters,
 * the first letter and the first later letter of the name that no other mark in that group uses
 * yet ("Kaari" → "Ka", "Kivira" → "Ki"). Names are taken in alphabetical order, so the marks never
 * depend on the order the companies arrive in.
 */
export function nodeMarks(companies: readonly { id: string; name: string }[]): Map<string, string> {
  const letters = (name: string) => [...name].filter((c) => LETTER.test(c));
  const groups = new Map<string, { id: string; rest: string[] }[]>();
  for (const company of [...companies].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))) {
    const [first = "", ...rest] = letters(company.name);
    const key = first.toUpperCase();
    groups.set(key, [...(groups.get(key) ?? []), { id: company.id, rest }]);
  }

  const marks = new Map<string, string>();
  for (const [first, members] of groups) {
    if (members.length === 1) {
      marks.set(members[0].id, first);
      continue;
    }
    const taken = new Set<string>();
    for (const { id, rest } of members) {
      const second = rest.map((c) => c.toLowerCase()).find((c) => !taken.has(c)) ?? rest[0]?.toLowerCase() ?? "";
      taken.add(second);
      marks.set(id, first + second);
    }
  }
  return marks;
}
