import type { Attachment, BlindProof, Challenge, ExplainAnswer, OwnProof, RedactionReport } from "@/lib/domain/types";
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

/** Copies only the named answer fields. `spoken` is kept only when true. */
function copyExplain(explain: ExplainAnswer[]): ExplainAnswer[] {
  return explain.map(({ question, answer, spoken }) => ({ question, answer, ...(spoken === true ? { spoken } : {}) }));
}

/** Copies only the named picture fields, so nothing else stored with a picture can ride along. */
function copyAttachment(attachment: Attachment | undefined): { attachment?: Attachment } {
  if (!attachment) return {};
  const { kind, src, alt, seconds, poster } = attachment;
  return {
    attachment: {
      kind,
      src,
      alt,
      ...(typeof seconds === "number" ? { seconds } : {}),
      ...(typeof poster === "string" ? { poster } : {}),
    },
  };
}

const spokenFlag = (spoken: boolean | undefined) => (spoken === true ? { spoken } : {});

export interface BlindProofInput {
  proofId: string;
  challenge: Pick<Challenge, "id" | "title" | "coreSkills" | "proofKind">;
  /** Already redacted. */
  work: string;
  /** Already redacted. */
  explain: ExplainAnswer[];
  /** Its `alt` text already redacted. */
  attachment?: Attachment;
  /** The answer was given by voice. */
  spoken?: boolean;
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
    proofKind: input.challenge.proofKind,
    work: input.work,
    explain: copyExplain(input.explain),
    ...copyAttachment(input.attachment),
    ...spokenFlag(input.spoken),
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
    proofKind: proof.proofKind,
    work: proof.work,
    explain: copyExplain(proof.explain),
    ...copyAttachment(proof.attachment),
    ...spokenFlag(proof.spoken),
    aiSummary: proof.aiSummary,
    hiddenCount: hiddenTotal(proof.redactions),
    submittedAt: proof.submittedAt,
  };
}
