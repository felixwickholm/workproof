import type { Challenge, JobRole } from "./types";

/** Every job role in display order, with the words people use for it. The chips on both sides use this list. */
export const JOB_ROLES = [
  "ai-developer",
  "software-engineer",
  "data-analyst",
  "financial-analyst",
  "marketing",
  "sales",
  "product-manager",
  "designer",
  "hardware-engineer",
  "civil-engineer",
  "researcher",
  "legal",
] as const satisfies readonly JobRole[];

export const ROLE_LABEL: Record<JobRole, string> = {
  "ai-developer": "AI developer",
  "software-engineer": "Software engineer",
  "data-analyst": "Data analyst",
  "financial-analyst": "Financial analyst",
  marketing: "Marketing",
  sales: "Sales",
  "product-manager": "Product manager",
  designer: "Designer",
  "hardware-engineer": "Hardware engineer",
  "civil-engineer": "Civil engineer",
  researcher: "Researcher",
  legal: "Legal",
};

export function isJobRole(value: unknown): value is JobRole {
  return typeof value === "string" && (JOB_ROLES as readonly string[]).includes(value);
}

/**
 * Words in a challenge's title or need that point to a role. Only for a challenge saved without
 * roles (older data, or a model's draft); the seed and the company's own pick set roles directly.
 */
const ROLE_WORDS: Record<JobRole, readonly string[]> = {
  "ai-developer": ["ai", "machine learning", "ml", "llm", "automation", "data scientist"],
  "software-engineer": ["software", "developer", "backend", "frontend", "code review", "python"],
  "data-analyst": ["data analyst", "data scientist", "analytics", "data quality", "statistics", "data visualisation"],
  "financial-analyst": ["finance", "financial", "budget", "bookkeeping", "accounting", "controller"],
  marketing: ["marketing", "campaign", "social media", "brand"],
  sales: ["sales", "account manager", "key account", "customer success"],
  "product-manager": ["product manager", "product owner", "roadmap"],
  designer: ["designer", "service design", "interaction design", "ux", "ui"],
  "hardware-engineer": ["hardware", "chip", "electronics", "embedded", "verification engineer", "timing analysis"],
  "civil-engineer": ["structural", "civil engineer", "construction", "renovation", "building regulations"],
  researcher: ["research scientist", "researcher", "scientific reasoning", "experiment design"],
  legal: ["legal", "lawyer", "contract", "compliance"],
};

function mentions(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}s?(?![\\p{L}\\p{N}])`, "u").test(text);
}

/** The roles a challenge is for: the ones saved with it, else the ones its own words name. Display order. */
export function rolesOf(challenge: Pick<Challenge, "roles" | "title" | "need">): JobRole[] {
  const saved = (challenge.roles ?? []).filter(isJobRole);
  if (saved.length) return JOB_ROLES.filter((r) => saved.includes(r));
  const text = `${challenge.title} ${challenge.need}`.toLowerCase();
  return JOB_ROLES.filter((role) => ROLE_WORDS[role].some((word) => mentions(text, word)));
}

/** True when the challenge is for at least one of the chosen roles. No roles chosen means none is. */
export function fitsRoles(challenge: Pick<Challenge, "roles" | "title" | "need">, chosen: readonly JobRole[]): boolean {
  return chosen.length > 0 && rolesOf(challenge).some((r) => chosen.includes(r));
}
