import type { ChallengeDraft } from "@/lib/domain/types";
import { isSkillId, SKILLS, type SkillId } from "@/lib/skills/vocabulary";
import { unicodeWords } from "@/lib/util/regex";
import { findJudgement } from "./no-judgement";
import { normaliseForScan } from "./normalise";
import { PROTECTED_NAMES, protectedNames } from "./protected";

/** The set-aside note that names protected wishes, for example "Not used: age, gender (not skills)". */
export const NOT_USED_PREFIX = "Not used:";

/** True when the text neither judges a person nor names a protected attribute. */
export function isNeutral(text: string): boolean {
  return findJudgement(text).length === 0 && protectedNames(text).length === 0;
}

/**
 * The need as talent sees it, always rebuilt from the role and the core skills in one fixed form.
 * The company's own sentence never reaches talent, so no word list has to catch every bias in it.
 * Languages and licences travel apart, as the challenge's fixed-form requirements.
 */
export function talentNeed(role: string | undefined, skills: SkillId[]): string {
  const labels = skills.map((id) => SKILLS[id].label).join(", ");
  return role ? `${role}: ${labels}` : `Core skills: ${labels}`;
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
    ...(draft.options ?? []).flatMap((o) => [
      { field: "option", text: o.title },
      { field: "option", text: o.body },
    ]),
    ...draft.coreSkills.flatMap((s) => [
      { field: "skill", text: s.label },
      { field: "skill reason", text: s.why },
    ]),
    ...draft.reviewGuide.map((g) => ({ field: "review guide", text: g.lookFor })),
    ...draft.setAside.filter((line) => !isNotUsedNote(line)).map((line) => ({ field: "set aside", text: line })),
  ];
}

const COUNT = "(?:\\d{1,3}|one|two|three|four|five|both)";
const FINDINGS = "(?:issues|problems|bugs|flaws|mistakes|errors)";

/**
 * A review guide says what good work shows. People give the points; a guide that hands them points, a scale or
 * a count of what to find would let software set the score. Numbers that name the material ("HTTP 500",
 * "line 12", "April") are task facts and pass.
 */
const GUIDE_SCALE = new RegExp(
  [
    "\\d\\s?(?:/|of|out of)\\s?\\d",
    "\\d{1,3}\\s?(?:points?|pts|marks?|stars?)\\b",
    "\\bpoints? (?:for|each|per)\\b",
    `\\b${COUNT} (?:of (?:the )?)?(?:\\p{L}+ )?${FINDINGS}\\b`,
    "\\bonly if (?:they|he|she|the person|the answer)\\b",
    "\\bon a scale\\b|\\bscale of\\b",
    "(?<!(?:credit|risk|test|f1|z|health|nps|confidence|similarity|anomaly|relevance|lead|bleu|quality) )\\bscor(?:e|es|ed|ing)\\b",
    "\\brat(?:e|es|ed|ing) (?:each|them|it|how|from|on|out|between|\\d)",
    "\\bgrading\\b|\\bmarks? (?:for|out)\\b|\\bout of (?:\\d|one|two|three|four|five|ten|a hundred)",
    "\\b(?:pisteet|pistettä|arvosana\\p{L}{0,10}|poäng|betyg)\\b",
  ].join("|"),
  "iu",
);

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
  const scaled = draft.reviewGuide.find((g) => unicodeWords(GUIDE_SCALE).test(normaliseForScan(g.lookFor)));
  if (scaled) problems.push("The review guide must say what good work shows, without points, counts or scales");
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
