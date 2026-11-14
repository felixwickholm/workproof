import type { ChallengeDraft, DraftedBy } from "@/lib/domain/types";
import { draftProblems, isNeutral } from "@/lib/guard/check-draft";
import { findJudgement, JudgementError } from "@/lib/guard/no-judgement";
import { protectedNames } from "@/lib/guard/protected";
import type { Breaker } from "./provider/breaker";
import type { CallBudget } from "./provider/budget";
import type { TaskDesigner } from "./task-designer";

/** Rejects an AI draft unless every field, the set-aside list included, is neutral and well formed. */
export function checkDraft(draft: ChallengeDraft): void {
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
export function checkQuestions(questions: string[]): void {
  if (questions.some((q) => q.length > 240 || !q.trim().endsWith("?"))) throw new Error("A follow-up is not a short question");
  checkTexts(questions);
}

interface Backup {
  /** Answers when the primary designer fails, is paused or its output is rejected. Its output is checked too. */
  designer: TaskDesigner;
  /** Called once per failed primary call; never for a call skipped by the breaker. */
  onFallback?: (method: string, error: unknown) => void;
  /** Skips the primary designer for a while after a provider failure. */
  breaker?: Breaker;
  /** Caps live calls per minute and at once; past it the backup answers without calling the primary. */
  budget?: CallBudget;
}

/**
 * Wraps a designer so nothing it produces can score, rank, recommend or describe a person.
 * Every draft says which designer wrote the accepted output.
 */
export function guarded(primary: TaskDesigner, backup?: Backup): TaskDesigner {
  async function answer<T>(designer: TaskDesigner, call: (d: TaskDesigner) => Promise<T>, check: (value: T) => void): Promise<T> {
    const value = await call(designer);
    check(value);
    return value;
  }

  async function run<T>(method: string, call: (d: TaskDesigner) => Promise<T>, check: (value: T) => void): Promise<{ value: T; by: DraftedBy }> {
    if (!backup) return { value: await answer(primary, call, check), by: primary.name };
    const byBackup = async () => ({ value: await answer(backup.designer, call, check), by: backup.designer.name });
    if (backup.breaker?.pause()) return byBackup();
    const release = backup.budget ? backup.budget.take() : () => undefined;
    if (!release) return byBackup();
    try {
      return { value: await answer(primary, call, check), by: primary.name };
    } catch (error) {
      backup.breaker?.record(error);
      backup.onFallback?.(method, error);
      return byBackup();
    } finally {
      release();
    }
  }

  async function draft(method: string, call: (d: TaskDesigner) => Promise<ChallengeDraft>): Promise<ChallengeDraft> {
    const { value, by } = await run(method, call, checkDraft);
    return { ...value, draftedBy: by };
  }

  return {
    name: primary.name,
    draftChallenge: (need) => draft("draftChallenge", (d) => d.draftChallenge(need)),
    taster: (dreamJob) => draft("taster", (d) => d.taster(dreamJob)),
    followUps: async (challenge, answerText) => (await run("followUps", (d) => d.followUps(challenge, answerText), checkQuestions)).value,
  };
}
