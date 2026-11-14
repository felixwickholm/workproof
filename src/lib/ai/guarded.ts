import type { ChallengeDraft } from "@/lib/domain/types";
import { draftProblems, isNeutral } from "@/lib/guard/check-draft";
import { findJudgement, JudgementError } from "@/lib/guard/no-judgement";
import { protectedNames } from "@/lib/guard/protected";
import type { TaskDesigner } from "./task-designer";

/** Rejects an AI draft unless every field, the set-aside list included, is neutral and well formed. */
function checkDraft(draft: ChallengeDraft): void {
  const problems = draftProblems(draft);
  if (problems.length > 0) throw new Error(`Draft rejected: ${problems.join("; ")}`);
}

/** Rejects AI text that judges a person or names a protected attribute. */
function checkTexts(texts: string[]): void {
  const violations = texts.flatMap(findJudgement);
  if (violations.length > 0) throw new JudgementError(violations);
  const named = texts.filter((t) => !isNeutral(t)).flatMap(protectedNames);
  if (named.length > 0) throw new Error(`Text names a protected attribute: ${named.join(", ")}`);
}

/** Follow-up questions: each a short question, neutral, naming nothing protected. */
function checkQuestions(questions: string[]): void {
  if (questions.some((q) => q.length > 240 || !q.trim().endsWith("?"))) throw new Error("A follow-up is not a short question");
  checkTexts(questions);
}

/**
 * Wraps a designer so nothing it produces can score, rank, recommend or describe a person.
 * When the primary designer fails or its output is rejected, the fallback answers instead.
 * The fallback's output is checked too.
 */
export function guarded(primary: TaskDesigner, fallback?: TaskDesigner, onFallback?: (method: string, error: unknown) => void): TaskDesigner {
  async function run<T>(method: string, call: (d: TaskDesigner) => Promise<T>, check: (value: T) => void): Promise<T> {
    try {
      const value = await call(primary);
      check(value);
      return value;
    } catch (error) {
      if (!fallback) throw error;
      onFallback?.(method, error);
      const value = await call(fallback);
      check(value);
      return value;
    }
  }

  return {
    name: primary.name,
    draftChallenge: (need) => run("draftChallenge", (d) => d.draftChallenge(need), checkDraft),
    taster: (dreamJob) => run("taster", (d) => d.taster(dreamJob), checkDraft),
    followUps: (challenge, answer) => run("followUps", (d) => d.followUps(challenge, answer), checkQuestions),
  };
}
