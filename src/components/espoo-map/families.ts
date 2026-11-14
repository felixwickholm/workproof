/**
 * Three families of employers, in the spirit of the schools at Otaniemi: technical,
 * commercial, and design and people. The map draws each family as its own pin shape.
 */
export type CompanyFamily = "technical" | "commercial" | "people";

export type PinShape = "circle" | "square" | "diamond";

export const FAMILY_ORDER: readonly CompanyFamily[] = ["technical", "commercial", "people"];

export const FAMILY_LABEL: Record<CompanyFamily, string> = {
  technical: "Technical",
  commercial: "Commercial",
  people: "Design and people",
};

export const FAMILY_SHAPE: Record<CompanyFamily, PinShape> = {
  technical: "circle",
  commercial: "square",
  people: "diamond",
};

/**
 * Word stems, checked in this order: deep tech first (so "Chip design" stays technical), then
 * design and people (so "Health technology" is care), then commercial, then the rest of technical.
 */
const STEMS: readonly [CompanyFamily, readonly string[]][] = [
  ["technical", ["chip", "semiconductor", "quantum", "deep tech"]],
  ["people", ["design", "health", "care", "nurs", "medic", "clinic", "educat", "school", "teach", "learning", "social", "wellbeing", "service design", "ux"]],
  ["commercial", ["business", "financ", "bank", "account", "insur", "sales", "retail", "commerce", "legal", "law", "complian", "consult", "marketing", "communicat", "media", "restaurant", "hospitality", "hotel", "real estate", "logistics"]],
  ["technical", ["tech", "software", "engineer", "research", "robot", "automation", "laborator", "energy", "data", "electronic", "materials", "space", "manufactur", "biotech"]],
];

/** The family of a company, from its sector in words. A sector no stem knows counts as technical. */
export function sectorFamily(sector: string): CompanyFamily {
  const words = sector.toLowerCase();
  // "ux" only as a whole word, so "deluxe" stays out.
  const matches = (stem: string) => (stem === "ux" ? /\bux\b/.test(words) : words.includes(stem));
  return STEMS.find(([, stems]) => stems.some(matches))?.[0] ?? "technical";
}
