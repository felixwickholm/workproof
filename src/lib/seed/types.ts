import type { Attachment, DecisionKind, MeetingStatus, SkillScore } from "@/lib/domain/types";
import type { SeedChallengeKey } from "./challenges";
import type { PersonKey } from "./people";

/**
 * A human decision on a seed proof, by the company's named reviewer. The demo's reviewers already did this
 * work before the event: every point and every reason here is a person's, never software's.
 */
export interface SeedDecision {
  companyId: string;
  kind: DecisionKind;
  /** Points 1 to 5, one per core skill of the task, in the task's own skill order. */
  points: SkillScore["points"][];
  /** One to three kind, specific sentences that fit the points. Never a comparison with other people. */
  feedback: string;
  /** Hours from the proof's arrival to this decision. */
  hoursToReply: number;
  /** A "meet" only: where the invitation stands now. */
  meeting?: MeetingStatus;
  /** A meeting both sides confirmed: the company agreed a follow-up talk. */
  followUpAgreed?: boolean;
  /** A meeting both sides confirmed: the company hired the person. */
  hired?: boolean;
}

/**
 * One piece of synthetic work. Every name, place and story in it is invented.
 * The answer and the think-aloud run through the same follow-up writer and blind layer as a live submission.
 */
export interface SeedProof {
  id: string;
  person: PersonKey;
  challenge: SeedChallengeKey;
  /** Hours before the event moment the proof arrived. */
  hoursAgo: number;
  /** The person lets other companies with the same skills see the blind work. */
  shareWithSimilar: boolean;
  answer: string;
  /** The option picked in a "choose" task. */
  choice?: "a" | "b";
  /** The answer was spoken; `answer` is the transcript. */
  spoken?: boolean;
  /** A picture or clip of the work, never of the person. */
  attachment?: Attachment;
  /** What the person said aloud while working, and how long the session ran. A few carry a sample screen clip. */
  thinkAloud: { transcript: string; seconds: number; screen?: Attachment };
  /** Answers to the follow-up questions, in order. */
  explainAnswers: string[];
  /** The follow-up answers were spoken; only the transcripts are kept. */
  spokenFollowUps?: boolean;
  decision?: SeedDecision;
}
