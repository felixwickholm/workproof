import type { BlindProof, Challenge, ExplainAnswer, RedactionReport } from "@/lib/domain/types";
import { hash } from "@/lib/util/hash";

// No I or O, so labels never read as 1 or 0.
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

/** A short neutral label such as "Proof K7", derived from the proof id and nothing about the person. */
export function proofLabel(proofId: string): string {
  const h = hash(proofId);
  return `Proof ${LETTERS[h % LETTERS.length]}${(Math.floor(h / LETTERS.length) % 9) + 1}`;
}

export interface BlindProofInput {
  proofId: string;
  challenge: Pick<Challenge, "id" | "title" | "coreSkills">;
  /** Already redacted. */
  work: string;
  /** Already redacted. */
  explain: ExplainAnswer[];
  aiSummary: string;
  redactions: RedactionReport;
  submittedAt: string;
}

/** Builds the reviewer view by naming every field it keeps. Nothing else can leak through. */
export function toBlindProof(input: BlindProofInput): BlindProof {
  return {
    proofId: input.proofId,
    label: proofLabel(input.proofId),
    challengeId: input.challenge.id,
    challengeTitle: input.challenge.title,
    skills: input.challenge.coreSkills.map(({ id, label, why }) => ({ id, label, why })),
    work: input.work,
    explain: input.explain.map(({ question, answer }) => ({ question, answer })),
    aiSummary: input.aiSummary,
    redactions: { ...input.redactions },
    submittedAt: input.submittedAt,
  };
}
