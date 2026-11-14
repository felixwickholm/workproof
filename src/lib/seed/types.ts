import type { Attachment, DecisionKind, MeetingStatus } from "@/lib/domain/types";
import type { SeedChallengeKey } from "./challenges";
import type { PersonKey } from "./people";

/** A human decision on a seed proof. The reviewer is the company's named reviewer. */
export interface SeedDecision {
  companyId: string;
  kind: DecisionKind;
  /** One to three kind, specific sentences. Never a score, a rank or a comparison with other people. */
  feedback: string;
  /** Hours from the proof's arrival to this decision. */
  hoursToReply: number;
  meeting?: MeetingStatus;
}

/**
 * One piece of synthetic work. Every name, place and story in it is invented.
 * The answer runs through the same follow-up writer and blind layer as a live submission.
 */
export interface SeedProof {
  id: string;
  person: PersonKey;
  challenge: SeedChallengeKey;
  /** Hours before the event moment the proof arrived. */
  hoursAgo: number;
  /** Opt-in to Second look. */
  shareWithSimilar: boolean;
  answer: string;
  /** The answer was spoken; `answer` is the transcript. */
  spoken?: boolean;
  /** A picture or clip of the work, never of the person. */
  attachment?: Attachment;
  /** Answers to the follow-up questions, in order. */
  explainAnswers: string[];
  /** The follow-up answers were spoken; only the transcripts are kept. */
  spokenFollowUps?: boolean;
  /** Owner decisions only. Second look decisions live in `second-look.ts`. */
  decision?: SeedDecision;
}
