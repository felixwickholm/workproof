import type { CityTaskView, ShareMatch } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { findOrThrow } from "../support";
import { eventChallenges } from "./event";
import { impactOf, isScored, proofIdsOf, topTotalOf } from "./leaderboard";

/** At least this many shared core skills before a proof may be offered to another company. */
export const MIN_SHARED_SKILLS = 2;

function eventTask(data: StoreData, challengeId: string) {
  return findOrThrow(eventChallenges(data), (c) => c.id === challengeId, "Challenge");
}

/**
 * One task for the city: its counts and its leaderboard as proof labels and the best human total each
 * proof got. No name, contact, private key or work text: the city reads labels, numbers and company names.
 */
export function buildCityTask(data: StoreData, challengeId: string): CityTaskView {
  const challenge = eventTask(data, challengeId);
  const ids = proofIdsOf(data, challengeId);
  const companyName = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "An employer";
  const best = new Map<string, number>();
  for (const d of data.decisions) if (ids.has(d.proofId) && isScored(d)) best.set(d.proofId, Math.max(best.get(d.proofId) ?? 0, d.total ?? 0));
  const counts = impactOf(data, ids);
  const top = data.proofs
    .filter((p) => best.has(p.proofId))
    .sort((a, b) => (best.get(b.proofId) ?? 0) - (best.get(a.proofId) ?? 0) || a.submittedAt.localeCompare(b.submittedAt))
    .map((p) => ({
      proofId: p.proofId,
      proofLabel: p.label,
      total: best.get(p.proofId) ?? 0,
      canShare: data.submissions.find((s) => s.id === p.proofId)?.shareWithSimilar === true,
      sharedWith: [...new Set((data.recommendations ?? []).filter((r) => r.proofId === p.proofId).map((r) => companyName(r.toCompanyId)))],
    }));
  return {
    challenge,
    challengeId,
    title: challenge.title,
    companies: challenge.companyIds.map(companyName),
    ...counts,
    topTotal: topTotalOf(data, challengeId),
    scoredShare: counts.took > 0 ? Math.round((counts.scored / counts.took) * 100) / 100 : 0,
    top,
  };
}

/** Companies that may receive a proof from this task: they own another event task sharing at least two core skills. */
export function shareMatches(data: StoreData, challengeId: string): ShareMatch[] {
  const challenge = eventTask(data, challengeId);
  const skillIds = new Set(challenge.coreSkills.map((s) => s.id));
  const byCompany = new Map<string, string[]>();
  for (const other of eventChallenges(data)) {
    if (other.id === challenge.id) continue;
    const shared = other.coreSkills.filter((s) => skillIds.has(s.id)).map((s) => s.label);
    if (shared.length < MIN_SHARED_SKILLS) continue;
    for (const companyId of other.companyIds) {
      if (challenge.companyIds.includes(companyId)) continue;
      if (shared.length > (byCompany.get(companyId)?.length ?? 0)) byCompany.set(companyId, shared);
    }
  }
  return [...byCompany].map(([companyId, sharedSkills]) => ({ companyId, name: data.companies.find((c) => c.id === companyId)?.name ?? "An employer", sharedSkills }));
}
