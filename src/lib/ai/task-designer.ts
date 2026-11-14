import type { Challenge, ChallengeDraft, DraftedBy } from "@/lib/domain/types";

/**
 * The AI side of Workprint. It drafts tasks and asks follow-up questions. It never reads or describes
 * work for a reviewer, and never decides, scores or ranks: every output passes the no-judgement guard.
 */
export interface TaskDesigner {
  readonly name: DraftedBy;
  /** Turns a company's free-text need into a Problem Card draft for a human to approve. */
  draftChallenge(need: string): Promise<ChallengeDraft>;
  /** A 2-minute task for someone who names their dream job. */
  taster(dreamJob: string): Promise<ChallengeDraft>;
  /** Questions about the person's own answer: 2 for event challenges, 1 for tasters. */
  followUps(challenge: Challenge, answer: string): Promise<string[]>;
}
