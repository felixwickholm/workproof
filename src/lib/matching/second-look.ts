import type { Challenge, Decision, Submission } from "@/lib/domain/types";

/** A proof needs this many shared core skills before another employer may see it. */
const MIN_SHARED_SKILLS = 2;

export interface SecondLookInput {
  submission: Submission;
  challenge: Challenge;
  decisions: Decision[];
  challenges: Challenge[];
  responseWindowHours: number;
  now: Date;
}

export interface SecondLookMatch {
  companyId: string;
  /** Labels of the core skills both challenges ask for. */
  sharedSkills: string[];
}

/**
 * The owners released the proof when none of them chose to meet and either one of them
 * passed or the response window ran out without any decision.
 */
function ownersReleased(input: Omit<SecondLookInput, "challenges">): boolean {
  const { submission, challenge, decisions, responseWindowHours, now } = input;
  const ownerDecisions = decisions.filter(
    (d) => d.proofId === submission.id && challenge.companyIds.includes(d.companyId),
  );
  if (ownerDecisions.some((d) => d.decision === "meet")) return false;
  if (ownerDecisions.some((d) => d.decision === "pass")) return true;
  const waitedHours = (now.getTime() - new Date(submission.submittedAt).getTime()) / 3_600_000;
  return ownerDecisions.length === 0 && waitedHours >= responseWindowHours;
}

/** Labels of core skills shared by two challenges. Compares challenges, never people. */
function sharedSkills(a: Challenge, b: Challenge): string[] {
  const ids = new Set(b.coreSkills.map((s) => s.id));
  return a.coreSkills.filter((s) => ids.has(s.id)).map((s) => s.label);
}

/** Companies that may now see this proof through Second look, with the skills behind each match. */
export function secondLookMatches(input: SecondLookInput): SecondLookMatch[] {
  const { submission, challenge, decisions, challenges } = input;
  if (!submission.shareWithSimilar || challenge.kind !== "event") return [];
  if (!ownersReleased(input)) return [];

  const byCompany = new Map<string, string[]>();
  for (const other of challenges) {
    if (other.kind !== "event" || !other.approvedBy || other.id === challenge.id) continue;
    const shared = sharedSkills(challenge, other);
    if (shared.length < MIN_SHARED_SKILLS) continue;
    for (const companyId of other.companyIds) {
      if (challenge.companyIds.includes(companyId)) continue;
      const decided = decisions.some((d) => d.proofId === submission.id && d.companyId === companyId);
      if (decided) continue;
      const known = byCompany.get(companyId);
      if (!known || shared.length > known.length) byCompany.set(companyId, shared);
    }
  }
  return [...byCompany].map(([companyId, skills]) => ({ companyId, sharedSkills: skills }));
}
