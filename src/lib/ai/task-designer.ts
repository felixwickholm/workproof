import type { Challenge, ChallengeDraft, ExplainAnswer } from "@/lib/domain/types";

/**
 * The AI side of Tryout. It drafts tasks and describes work.
 * It never decides, scores or ranks: every output passes the no-judgement guard.
 */
export interface TaskDesigner {
  readonly name: string;
  /** Turns a company's free-text need into a Problem Card draft for a human to approve. */
  draftChallenge(need: string): Promise<ChallengeDraft>;
  /** A 2-minute task for someone who names their dream job. */
  taster(dreamJob: string): Promise<ChallengeDraft>;
  /** Questions about the person's own answer: 2 for event challenges, 1 for tasters. */
  followUps(challenge: Challenge, answer: string): Promise<string[]>;
  /** A neutral description of what the work contains. Never a judgement. */
  summariseWork(challenge: Challenge, answer: string, explain: ExplainAnswer[]): Promise<string>;
}
