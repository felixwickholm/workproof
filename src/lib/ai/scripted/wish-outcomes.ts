import type { WishOutcome } from "@/lib/domain/types";
import { parseForRole } from "./compose";
import type { ParsedWish, WishKind } from "./parse-need";

export const PERSON_REASON = "It describes a person, not the work.";
/** A native speaker describes origin. The lawful version of the wish is a language level. */
export const NATIVE_REASON = "Ask for a language level, not a native speaker.";
export const FACT_REASON = "A fact about the job: talent sees it under Good to know.";
export const EXPERIENCE_REASON = "The work shows ability directly.";
export const EXTRA_REASON = "More than five: a task tests 3 to 5 core skills.";
const NOT_CORE_REASON = "Not core for this task.";

const REASONS: Record<Exclude<WishKind, "skill" | "person" | "fact">, string> = {
  experience: EXPERIENCE_REASON,
  language: "Talk about it in the meeting.",
  tool: "A tool: the task allows any tool.",
  other: NOT_CORE_REASON,
};

/** The longest list one task can test. Past it, a skill wish that is not kept is an extra. */
const MAX_SKILLS = 5;

function outcomesOf(item: ParsedWish, kept: ReadonlySet<string>, crowded: boolean): WishOutcome[] {
  if (item.kind === "person") {
    return item.person.map((name) => ({ text: name, outcome: "set-aside", reason: name === "native language" ? NATIVE_REASON : PERSON_REASON }));
  }
  if (item.kind === "fact") return [{ text: item.text, outcome: "fact", reason: FACT_REASON }];
  if (item.kind !== "skill") return [{ text: item.text, outcome: "set-aside", reason: REASONS[item.kind] }];
  const skillId = item.skills.find((id) => kept.has(id));
  if (skillId) return [{ text: item.text, outcome: "kept", skillId }];
  return [{ text: item.text, outcome: "set-aside", reason: crowded ? EXTRA_REASON : NOT_CORE_REASON }];
}

/**
 * What became of each wish in the company's sentence, given the core skills the draft kept. Works for any
 * designer's draft, so the company always sees it. A wish about the person appears only as its neutral
 * category name, once per category, so the words typed are never repeated back.
 */
export function wishOutcomes(need: string, coreSkillIds: readonly string[]): WishOutcome[] {
  const parsed = parseForRole(need);
  const kept = new Set(coreSkillIds);
  const crowded = parsed.items.length > MAX_SKILLS || parsed.wishedSkills.length > MAX_SKILLS;
  const outcomes = parsed.items.flatMap((item) => outcomesOf(item, kept, crowded));
  // "Young" and "under 30" are one wish about age, shown once.
  return outcomes.filter((w, i) => (w.reason !== PERSON_REASON && w.reason !== NATIVE_REASON) || outcomes.findIndex((o) => o.text === w.text) === i);
}
