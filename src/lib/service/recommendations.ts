import type { Recommendation } from "@/lib/domain/types";
import { getStore, type StoreData } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { shareMatches } from "./views/city-task";
import { isScored } from "./views/leaderboard";

export const NO_CONSENT = "The person has not allowed sharing this work with other companies";
export const NOT_SCORED = "Score this work before you share it";
export const NO_MATCH = "That company has no challenge that shares two or more core skills with this one";

interface Share {
  proofId: string;
  fromCompanyId: string;
  toCompanyId: string;
  /** The person at the city who shared it, when the city did. */
  byCity?: string;
}

/**
 * Records one recommendation after the rules: the person turned sharing on, the work was scored by a person
 * at `fromCompanyId`, and the receiving company has a challenge sharing at least two core skills. The
 * receiving company later sees the blind work and who shared it, never the scores.
 */
function share(data: StoreData, input: Share): Recommendation {
  const submission = findOrThrow(data.submissions, (s) => s.id === input.proofId, "Proof");
  const proof = findOrThrow(data.proofs, (p) => p.proofId === input.proofId, "Proof");
  const from = findOrThrow(data.companies, (c) => c.id === input.fromCompanyId, "Company");
  const to = findOrThrow(data.companies, (c) => c.id === input.toCompanyId, "Company");
  if (!submission.shareWithSimilar) throw new ServiceError(403, NO_CONSENT);
  if (!data.decisions.some((d) => d.proofId === proof.proofId && d.companyId === from.id && isScored(d))) throw new ServiceError(409, NOT_SCORED);
  if (!shareMatches(data, submission.challengeId).some((m) => m.companyId === to.id)) throw new ServiceError(409, NO_MATCH);
  if (data.decisions.some((d) => d.proofId === proof.proofId && d.companyId === to.id)) throw new ServiceError(409, `${to.name} has already answered this work`);
  if ((data.recommendations ?? []).some((r) => r.proofId === proof.proofId && r.toCompanyId === to.id)) throw new ServiceError(409, `This work is already shared with ${to.name}`);

  const recommendation: Recommendation = {
    id: newId("rec"),
    proofId: proof.proofId,
    fromCompanyId: from.id,
    toCompanyId: to.id,
    at: clock.now().toISOString(),
    ...(input.byCity ? { byCity: input.byCity } : {}),
  };
  data.recommendations = [...(data.recommendations ?? []), recommendation];
  appendAudit(data, {
    actor: "human",
    by: input.byCity ?? from.name,
    action: "Shared a good candidate",
    detail: `${proof.label} from ${from.name}'s challenge shared with ${to.name}, with the person's consent. No name and no scores go with it.`,
  });
  return recommendation;
}

/** A company shares work it scored with another company that hires for the same skills. */
export async function recommend(input: { proofId: string; fromCompanyId: string; toCompanyId: string }): Promise<Recommendation> {
  return getStore().update((data) => share(data, input));
}

/** The city shares a scored proof from one company's challenge with another company. */
export async function recommendForCity(input: { proofId: string; toCompanyId: string; by: string }): Promise<Recommendation> {
  const by = input.by.trim();
  if (!/\p{L}.*\p{L}/u.test(by)) throw new ServiceError(400, "Add the name of the person at the city who shares it");
  return getStore().update((data) => {
    const submission = findOrThrow(data.submissions, (s) => s.id === input.proofId, "Proof");
    const owners = data.challenges.find((c) => c.id === submission.challengeId)?.companyIds ?? [];
    const scorer = data.decisions.find((d) => d.proofId === input.proofId && owners.includes(d.companyId) && isScored(d));
    if (!scorer) throw new ServiceError(409, NOT_SCORED);
    return share(data, { proofId: input.proofId, fromCompanyId: scorer.companyId, toCompanyId: input.toCompanyId, byCity: by });
  });
}

/** When the person turns sharing off, recommendations the receiving company has not answered are taken back. */
export function withdrawRecommendations(data: StoreData, proofId: string): void {
  if (!data.recommendations) return;
  const answered = new Set(data.decisions.filter((d) => d.proofId === proofId).map((d) => d.companyId));
  data.recommendations = data.recommendations.filter((r) => r.proofId !== proofId || answered.has(r.toCompanyId));
}

/** True when a company may answer this proof because it was shared with it and the person still allows sharing. */
export function recommendedTo(data: StoreData, proofId: string, companyId: string): boolean {
  const sharing = data.submissions.find((s) => s.id === proofId)?.shareWithSimilar === true;
  return sharing && (data.recommendations ?? []).some((r) => r.proofId === proofId && r.toCompanyId === companyId);
}
