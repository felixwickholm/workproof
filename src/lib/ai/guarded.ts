import type { ChallengeDraft } from "@/lib/domain/types";
import { collectText, findJudgement, JudgementError } from "@/lib/guard/no-judgement";
import { omit } from "@/lib/util/object";
import type { TaskDesigner } from "./task-designer";

/**
 * Fields of a draft written by the AI. `need` and `setAside` hold the company's own words,
 * so they are shown as the company wrote them and are not checked here.
 */
function authoredText(draft: ChallengeDraft): string[] {
  return collectText(omit(draft, ["need", "setAside"]));
}

function check(texts: string[]): void {
  const violations = texts.flatMap(findJudgement);
  if (violations.length > 0) throw new JudgementError(violations);
}

/**
 * Wraps a designer so nothing it produces can score, rank or recommend.
 * When the primary designer fails or its output is rejected, the fallback answers instead.
 * The fallback's output is checked too.
 */
export function guarded(primary: TaskDesigner, fallback?: TaskDesigner, onFallback?: (method: string, error: unknown) => void): TaskDesigner {
  async function run<T>(method: string, call: (d: TaskDesigner) => Promise<T>, texts: (value: T) => string[]): Promise<T> {
    try {
      const value = await call(primary);
      check(texts(value));
      return value;
    } catch (error) {
      if (!fallback) throw error;
      onFallback?.(method, error);
      const value = await call(fallback);
      check(texts(value));
      return value;
    }
  }

  return {
    name: primary.name,
    draftChallenge: (need) => run("draftChallenge", (d) => d.draftChallenge(need), authoredText),
    taster: (dreamJob) => run("taster", (d) => d.taster(dreamJob), authoredText),
    followUps: (challenge, answer) => run("followUps", (d) => d.followUps(challenge, answer), (q) => q),
    summariseWork: (challenge, answer, explain) =>
      run("summariseWork", (d) => d.summariseWork(challenge, answer, explain), (s) => [s]),
  };
}
