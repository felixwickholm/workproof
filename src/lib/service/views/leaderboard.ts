import { toBlindProof } from "@/lib/blind/project";
import type { CompanyTaskSummary, Decision, ImpactCounts, Meeting, Talent, TaskCounts, TopProof, TopProofs } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { byArrival, findOrThrow } from "../support";
import { ownChallenges } from "./queue";

const agreed = (m: Meeting) => m.status === "accepted" || m.status === "met";

/** Decisions that carry a reviewer's scores. Older records without scores are answers, not scores. */
export const isScored = (d: Decision): d is Decision & { scores: NonNullable<Decision["scores"]>; total: number } =>
  Boolean(d.scores && d.scores.length > 0 && typeof d.total === "number");

/**
 * Proofs at each step, each proof counted once, over the given proofs: sent, scored by a human, invited,
 * agreed (the person accepted), met (both confirmed), a follow-up agreed after the talk, hired.
 */
export function impactOf(data: StoreData, proofIds: ReadonlySet<string>): ImpactCounts {
  const meetings = data.meetings.filter((m) => proofIds.has(m.proofId));
  const proofsWith = (test: (m: Meeting) => boolean) => new Set(meetings.filter(test).map((m) => m.proofId)).size;
  return {
    took: proofIds.size,
    scored: new Set(data.decisions.filter((d) => proofIds.has(d.proofId) && isScored(d)).map((d) => d.proofId)).size,
    invited: proofsWith(() => true),
    agreed: proofsWith(agreed),
    met: proofsWith((m) => m.status === "met"),
    followUps: proofsWith((m) => m.followUpAgreed === true),
    hires: proofsWith((m) => m.hired === true),
  };
}

/** The ids of every proof sent to one task. */
export function proofIdsOf(data: StoreData, challengeId: string): Set<string> {
  return new Set(data.proofs.filter((p) => p.challengeId === challengeId).map((p) => p.proofId));
}

function countsOf(data: StoreData, challengeId: string): TaskCounts {
  const { took, scored, invited, agreed: agreedCount } = impactOf(data, proofIdsOf(data, challengeId));
  return { took, scored, invited, agreed: agreedCount };
}

/** The highest human total on a task, from any company's scores, or null before one. */
export function topTotalOf(data: StoreData, challengeId: string): number | null {
  const ids = proofIdsOf(data, challengeId);
  const totals = data.decisions.filter((d) => ids.has(d.proofId) && isScored(d)).map((d) => d.total ?? 0);
  return totals.length > 0 ? Math.max(...totals) : null;
}

/**
 * The leaderboard for one of a company's tasks: proofs it scored, highest human total first and ties by
 * arrival, then the proofs it has not scored yet, oldest first. Blind projections only; a name only after
 * the person accepted this company's meeting, the same rule as the queue.
 */
export function buildTopProofs(data: StoreData, companyId: string, taskId: string): TopProofs {
  const challenge = findOrThrow(ownChallenges(data, companyId), (c) => c.id === taskId, "Challenge");
  const proofs = data.proofs.filter((p) => p.challengeId === taskId).sort(byArrival);
  const scoredBy = new Map(data.decisions.filter((d) => d.companyId === companyId && isScored(d)).map((d) => [d.proofId, d]));

  const scored: TopProof[] = proofs.flatMap((proof) => {
    const decision = scoredBy.get(proof.proofId);
    if (!decision || !isScored(decision)) return [];
    const meeting = data.meetings.find((m) => m.proofId === proof.proofId && m.companyId === companyId);
    let identity: Pick<Talent, "name" | "contact"> | undefined;
    if (meeting && agreed(meeting)) {
      const talentId = data.submissions.find((s) => s.id === proof.proofId)?.talentId;
      const talent = data.talents.find((t) => t.id === talentId);
      if (talent) identity = { name: talent.name, contact: talent.contact };
    }
    return [{ proof: toBlindProof(proof), total: decision.total, scores: decision.scores, decision, ...(meeting ? { meeting } : {}), ...(identity ? { identity } : {}) }];
  });
  // A stable sort keeps arrival order among equal totals.
  scored.sort((a, b) => b.total - a.total);

  return {
    challenge,
    scored,
    waiting: proofs.filter((p) => !scoredBy.has(p.proofId)).map(toBlindProof),
    counts: countsOf(data, taskId),
  };
}

/** Each of a company's published tasks, newest first, with its counts and its top total. */
export function buildCompanyTasks(data: StoreData, companyId: string): CompanyTaskSummary[] {
  findOrThrow(data.companies, (c) => c.id === companyId, "Company");
  return [...ownChallenges(data, companyId)]
    .reverse()
    .map((challenge) => ({ challenge, counts: countsOf(data, challenge.id), topTotal: topTotalOf(data, challenge.id) }));
}
