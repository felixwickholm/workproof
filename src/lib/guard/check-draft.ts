import type { ChallengeDraft } from "@/lib/domain/types";
import { isSkillId, SKILLS, type SkillId } from "@/lib/skills/vocabulary";
import { findJudgement } from "./no-judgement";
import { PROTECTED_NAMES, protectedNames } from "./protected";

/** The set-aside note that names protected wishes, for example "Not used: age, gender (not skills)". */
export const NOT_USED_PREFIX = "Not used:";

/** True when the text neither judges a person nor names a protected attribute. */
export function isNeutral(text: string): boolean {
  return findJudgement(text).length === 0 && protectedNames(text).length === 0;
}

/**
 * The need as talent sees it. The company's cleaned sentence is shown only when a final scan finds
 * nothing protected or judging in it; otherwise the need is rebuilt from the role and the core skills.
 */
export function talentNeed(cleaned: string, role: string | undefined, skills: SkillId[], languages: string[] = []): string {
  const sentence = cleaned.trim();
  if (sentence.length >= 3 && isNeutral(sentence)) return sentence;
  const labels = skills.map((id) => SKILLS[id].label);
  return [`${role ?? "A role"}: ${labels.join(", ")}`, ...languages].join(". ");
}

/** True for a well-formed "Not used: a, b (not skills)" note that lists only neutral attribute names. */
function isNotUsedNote(line: string): boolean {
  const found = /^Not used: (.+) \(not skills\)$/.exec(line);
  return Boolean(found && found[1].split(", ").every((name) => PROTECTED_NAMES.includes(name)));
}

/** Keeps set-aside lines that are neutral. The "Not used" note may name attributes, and nothing else. */
export function neutralSetAside(lines: string[]): string[] {
  return lines.filter((line) => (line.startsWith(NOT_USED_PREFIX) ? isNotUsedNote(line) : isNeutral(line)));
}

/** Every text a draft carries. The "Not used" note is checked by its shape instead. */
function textFields(draft: ChallengeDraft): { field: string; text: string }[] {
  return [
    { field: "title", text: draft.title },
    { field: "need", text: draft.need },
    { field: "brief", text: draft.brief },
    { field: "deliverable", text: draft.deliverable },
    ...(draft.material
      ? [
          { field: "material title", text: draft.material.title },
          { field: "material", text: draft.material.body },
        ]
      : []),
    ...draft.coreSkills.flatMap((s) => [
      { field: "skill", text: s.label },
      { field: "skill reason", text: s.why },
    ]),
    ...draft.reviewGuide.map((g) => ({ field: "review guide", text: g.lookFor })),
    ...draft.setAside.filter((line) => !isNotUsedNote(line)).map((line) => ({ field: "set aside", text: line })),
  ];
}

/**
 * Every reason a draft may not be published, in plain words. Empty when the draft is fine.
 * Runs on AI drafts and again on the server before a human-approved draft is published.
 */
export function draftProblems(draft: ChallengeDraft): string[] {
  const problems: string[] = [];
  for (const { field, text } of textFields(draft)) {
    const judging = findJudgement(text);
    if (judging.length > 0) problems.push(`The ${field} judges a person or their work ("${judging[0].match}")`);
    const named = protectedNames(text);
    if (named.length > 0) problems.push(`The ${field} asks about ${named.join(", ")}, which is not a skill`);
  }
  const ids = draft.coreSkills.map((s) => s.id);
  if (ids.length < 3 || ids.length > 5) problems.push("A challenge needs 3 to 5 core skills");
  const unknown = ids.filter((id) => !isSkillId(id));
  if (unknown.length > 0) problems.push(`Unknown skill: ${unknown.join(", ")}. Use skills from the shared list`);
  if (new Set(ids).size !== ids.length) problems.push("A skill is listed twice");
  const known = ids.filter(isSkillId);
  const wrongLabel = draft.coreSkills.filter((s) => isSkillId(s.id) && s.label !== SKILLS[s.id].label);
  if (wrongLabel.length > 0) problems.push(`Skill names must match the shared list: ${wrongLabel.map((s) => s.label).join(", ")}`);
  const uncovered = known.filter((id) => !draft.reviewGuide.some((g) => g.skillId === id && g.lookFor.trim()));
  if (uncovered.length > 0) problems.push(`The review guide has no note for ${uncovered.map((id) => SKILLS[id].label).join(", ")}`);
  return problems;
}
