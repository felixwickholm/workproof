import { containsTerm } from "@/lib/ai/scripted/match-role";
import type { BlindProof, Challenge, RelatedPart } from "@/lib/domain/types";
import { findJudgement } from "@/lib/guard/no-judgement";
import { SKILL_CUES } from "@/lib/skills/cues";
import { isSkillId, SKILLS } from "@/lib/skills/vocabulary";

/** Sentences shown per skill. */
const QUOTES_PER_SKILL = 3;

/** Sentences of the blind work and the think-aloud transcript, in the order the person wrote or said them. */
function sentencesOf(proof: Pick<BlindProof, "work" | "thinkAloud">): string[] {
  return [proof.work, proof.thinkAloud?.transcript ?? ""]
    .join("\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 3);
}

/**
 * Where each core skill shows up in the work: up to three of the person's own sentences that contain one of
 * the skill's words. Code, not a model, and never a number: a sentence with a digit or a judging word is
 * left out, so nothing here can read as a score. The reviewer still reads the whole work and scores it.
 */
export function relatedParts(proof: Pick<BlindProof, "work" | "thinkAloud">, challenge: Pick<Challenge, "coreSkills">): RelatedPart[] {
  const sentences = sentencesOf(proof).filter((s) => !/\p{N}/u.test(s) && findJudgement(s).length === 0);
  return challenge.coreSkills.map((skill) => {
    const words = isSkillId(skill.id) ? [...SKILLS[skill.id].synonyms, ...(SKILL_CUES[skill.id] ?? [])] : [];
    const quotes = sentences.filter((s) => words.some((w) => containsTerm(s.toLowerCase(), w))).slice(0, QUOTES_PER_SKILL);
    return { skillId: skill.id, label: skill.label, quotes };
  });
}
