import type { Challenge, SkillScore } from "./types";

/**
 * One fixed scale for every skill and every reviewer, so two people scoring the same work read the same
 * words. Points are given only by a named human reviewer. Software never scores.
 */
export const SCORE_LEVELS: readonly { points: SkillScore["points"]; label: string; meaning: string }[] = [
  { points: 1, label: "Not shown", meaning: "The work does not show this skill." },
  { points: 2, label: "A little", meaning: "A hint of it, no detail." },
  { points: 3, label: "Shown", meaning: "Shown once, in a way that would work." },
  { points: 4, label: "Shown well", meaning: "Shown clearly, more than once." },
  { points: 5, label: "Shown well, with reasons", meaning: "Shown clearly, and the person says why." },
];

const MIN_POINTS = SCORE_LEVELS[0].points;
const MAX_POINTS = SCORE_LEVELS[SCORE_LEVELS.length - 1].points;

/** The total out of 10: the average points × 2, one decimal. 0 with no scores. */
export function totalOf(scores: readonly { points: number }[]): number {
  if (scores.length === 0) return 0;
  const average = scores.reduce((sum, s) => sum + s.points, 0) / scores.length;
  return Math.round(average * 20) / 10;
}

/** Why scores do not fit the challenge, or undefined: exactly one whole number from 1 to 5 per core skill. */
export function scoreProblem(scores: readonly { skillId: string; points: number }[], challenge: Pick<Challenge, "coreSkills">): string | undefined {
  const ids = challenge.coreSkills.map((s) => s.id);
  const given = new Set(scores.map((s) => s.skillId));
  const fits = scores.length === ids.length && given.size === scores.length && ids.every((id) => given.has(id));
  if (!fits) return `Score each of the ${ids.length} skills of this task once, from ${MIN_POINTS} to ${MAX_POINTS}`;
  if (scores.some((s) => !Number.isInteger(s.points) || s.points < MIN_POINTS || s.points > MAX_POINTS)) return `Points go from ${MIN_POINTS} to ${MAX_POINTS}`;
  return undefined;
}

/** The scores in the challenge's own skill order, typed as points. Call after `scoreProblem` found nothing. */
export function orderedScores(scores: readonly { skillId: string; points: number }[], challenge: Pick<Challenge, "coreSkills">): SkillScore[] {
  return challenge.coreSkills.map((skill) => ({ skillId: skill.id, points: scores.find((s) => s.skillId === skill.id)?.points as SkillScore["points"] }));
}
