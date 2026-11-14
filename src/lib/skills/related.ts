import { containsTerm } from "@/lib/ai/scripted/match-role";
import type { RelatedPart, Skill } from "@/lib/domain/types";
import { SKILL_CUES, WORK_CUES } from "./cues";
import { isSkillId, SKILLS } from "./vocabulary";

/** At most this many sentences per skill, so the marks point to places rather than repeat the work. */
const QUOTES_PER_SKILL = 3;

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 3);
}

/** Every word that points to this skill in finished work: work cues first, then need cues, synonyms and the label. */
function termsFor(skillId: string): readonly string[] {
  if (!isSkillId(skillId)) return [];
  return [...(WORK_CUES[skillId] ?? []), ...SKILL_CUES[skillId], ...SKILLS[skillId].synonyms, SKILLS[skillId].label.toLowerCase()];
}

/**
 * Where each core skill shows up in a piece of work: the sentences that contain one of its cue words.
 * Built from words only, with no model and no number, so it marks places to read and never judges them.
 * Pass the blind text, so a quote never carries a hidden detail.
 */
export function relatedParts(text: string, skills: readonly Pick<Skill, "id" | "label">[]): RelatedPart[] {
  const sentences = sentencesOf(text);
  return skills.map((skill) => {
    const terms = termsFor(skill.id);
    const quotes = sentences.filter((sentence) => {
      const lower = sentence.toLowerCase();
      return terms.some((term) => containsTerm(lower, term));
    });
    return { skillId: skill.id, label: skill.label, quotes: quotes.slice(0, QUOTES_PER_SKILL) };
  });
}
