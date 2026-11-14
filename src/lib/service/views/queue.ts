import type { ReviewQueue, Talent } from "@/lib/domain/types";
import { toBlindProof } from "@/lib/blind/project";
import { secondLookMatches } from "@/lib/matching/second-look";
import type { StoreData } from "@/lib/store";
import { byArrival, findOrThrow } from "../support";

/** Employers that may read a proof through Second look right now. */
export function matchesFor(data: StoreData, proofId: string, now: Date) {
  const submission = data.submissions.find((s) => s.id === proofId);
  const challenge = submission && data.challenges.find((c) => c.id === submission.challengeId);
  if (!submission || !challenge) return [];
  return secondLookMatches({
    submission,
    challenge,
    decisions: data.decisions,
    challenges: data.challenges,
    responseWindowHours: data.event.responseWindowHours,
    now,
  });
}

/** A company's published event tasks, oldest first. */
export function ownChallenges(data: StoreData, companyId: string) {
  return data.challenges
    .filter((c) => c.kind === "event" && c.approvedBy && c.companyIds.includes(companyId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** What a company reviewer sees. Only blind proofs, oldest first; identity only after acceptance. */
export function buildQueue(data: StoreData, companyId: string, now: Date): ReviewQueue {
  const company = findOrThrow(data.companies, (c) => c.id === companyId, "Company");
  const challenges = ownChallenges(data, companyId);
  const ownChallengeIds = new Set(challenges.map((c) => c.id));
  const decidedIds = new Set(data.decisions.filter((d) => d.companyId === companyId).map((d) => d.proofId));

  const proofs = data.proofs
    .filter((p) => ownChallengeIds.has(p.challengeId) && !decidedIds.has(p.proofId))
    .sort(byArrival)
    .map(toBlindProof);

  const secondLook = data.proofs
    .filter((p) => !ownChallengeIds.has(p.challengeId) && !decidedIds.has(p.proofId))
    .flatMap((p) => {
      const match = matchesFor(data, p.proofId, now).find((m) => m.companyId === companyId);
      return match ? [{ ...toBlindProof(p), sharedSkills: match.sharedSkills }] : [];
    })
    .sort(byArrival);

  const decided = data.decisions
    .filter((d) => d.companyId === companyId)
    .sort((a, b) => a.decidedAt.localeCompare(b.decidedAt))
    .map((decision) => {
      const proof = findOrThrow(data.proofs, (p) => p.proofId === decision.proofId, "Proof");
      const meeting = data.meetings.find((m) => m.proofId === decision.proofId && m.companyId === companyId);
      let identity: Pick<Talent, "name" | "contact"> | undefined;
      if (meeting && (meeting.status === "accepted" || meeting.status === "met")) {
        const submission = data.submissions.find((s) => s.id === decision.proofId);
        const talent = data.talents.find((t) => t.id === submission?.talentId);
        // Name and contact only. The talent id is the person's private key.
        if (talent) identity = { name: talent.name, contact: talent.contact };
      }
      return { proof: toBlindProof(proof), decision, ...(meeting ? { meeting } : {}), ...(identity ? { identity } : {}) };
    });

  return { company, challenges, proofs, secondLook, decided };
}
