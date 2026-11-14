import type { BlindProof, Challenge, ExplainAnswer, OwnProof, RedactionReport } from "@/lib/domain/types";
import { hash } from "@/lib/util/hash";

// No I or O, so labels never read as 1 or 0.
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * A short neutral label such as "Proof K7", derived from the proof id and nothing about the person.
 * Labels in `taken` are skipped: the label grows to two digits, then three, so it stays unique.
 */
export function proofLabel(proofId: string, taken: ReadonlySet<string> = new Set()): string {
  for (let attempt = 0; ; attempt++) {
    const h = hash(attempt === 0 ? proofId : `${proofId}:${attempt}`);
    const letter = LETTERS[h % LETTERS.length];
    const rest = Math.floor(h / LETTERS.length);
    const digits = attempt < 4 ? (rest % 9) + 1 : attempt < 200 ? (rest % 90) + 10 : (rest % 900) + 100;
    const label = `Proof ${letter}${digits}`;
    if (!taken.has(label)) return label;
  }
}

function hiddenTotal(report: RedactionReport): number {
  return Object.values(report).reduce((sum, n) => sum + n, 0);
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
  /** Labels already in use, so the new one is unique. */
  takenLabels?: ReadonlySet<string>;
}

/** Builds the author's view of a proof by naming every field it keeps. Nothing else can leak through. */
export function toOwnProof(input: BlindProofInput): OwnProof {
  return {
    proofId: input.proofId,
    label: proofLabel(input.proofId, input.takenLabels),
    challengeId: input.challenge.id,
    challengeTitle: input.challenge.title,
    skills: input.challenge.coreSkills.map(({ id, label, why }) => ({ id, label, why })),
    work: input.work,
    explain: input.explain.map(({ question, answer }) => ({ question, answer })),
    aiSummary: input.aiSummary,
    hiddenCount: hiddenTotal(input.redactions),
    redactions: { ...input.redactions },
    submittedAt: input.submittedAt,
  };
}

/** The reviewer view: one total of hidden details, never the categories. */
export function toBlindProof(proof: OwnProof): BlindProof {
  return {
    proofId: proof.proofId,
    label: proof.label,
    challengeId: proof.challengeId,
    challengeTitle: proof.challengeTitle,
    skills: proof.skills.map(({ id, label, why }) => ({ id, label, why })),
    work: proof.work,
    explain: proof.explain.map(({ question, answer }) => ({ question, answer })),
    aiSummary: proof.aiSummary,
    hiddenCount: hiddenTotal(proof.redactions),
    submittedAt: proof.submittedAt,
  };
}
