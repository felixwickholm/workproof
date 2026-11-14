import { isFinnishStem } from "@/lib/skills/finnish-stems";
import type { RoleTemplate } from "./role-template";
import { ROLES } from "./roles";

export function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Finnish stems may sit inside compounds ("potilasturvallisuus"). Every other term matches whole
 * words only, with an English plural allowed, so "career" never matches "care".
 */
export function containsTerm(text: string, term: string): boolean {
  if (term.length > 3 && isFinnishStem(term)) return text.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?:s|es)?(?![\\p{L}\\p{N}])`, "u").test(text);
}

/**
 * Picks the role whose keywords cover the most of the text. Longer phrases weigh more,
 * so "ml engineer for robotics" lands on ML engineer rather than robotics.
 * The opening clause usually names the role, so matches there count three times.
 * Returns undefined when nothing matches.
 */
export function matchRole(text: string): RoleTemplate | undefined {
  const haystack = normalise(text);
  const opening = haystack.split(/[,:;.]/)[0];
  let chosen: RoleTemplate | undefined;
  let chosenWeight = 0;
  for (const role of ROLES) {
    const weight = role.keywords
      .filter((keyword) => containsTerm(haystack, keyword))
      .reduce((sum, keyword) => sum + keyword.length * (containsTerm(opening, keyword) ? 3 : 1), 0);
    if (weight > chosenWeight) {
      chosen = role;
      chosenWeight = weight;
    }
  }
  return chosen;
}
