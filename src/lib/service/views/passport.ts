import type { PassportEntry } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { matchesFor } from "./queue";

/** The person's own proofs, newest first, with every human response they received: the reviewer, their scores and reason. */
export function buildPassport(data: StoreData, talentId: string, now: Date): PassportEntry[] {
  const companyName = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "An employer";
  return data.submissions
    .filter((s) => s.talentId === talentId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .flatMap((submission) => {
      const proof = data.proofs.find((p) => p.proofId === submission.id);
      const challenge = data.challenges.find((c) => c.id === submission.challengeId);
      if (!proof || !challenge) return [];
      const decisions = data.decisions.filter((d) => d.proofId === submission.id);
      const responses = decisions.map((d) => {
        const meeting = data.meetings.find((m) => m.proofId === submission.id && m.companyId === d.companyId);
        return {
          companyName: companyName(d.companyId),
          reviewer: d.reviewer,
          ...(d.scores?.length ? { scores: d.scores.map((score) => ({ ...score, label: challenge.coreSkills.find((s) => s.id === score.skillId)?.label ?? score.skillId })), total: d.total } : {}),
          decision: d.decision,
          feedback: d.feedback,
          viaSecondLook: !challenge.companyIds.includes(d.companyId),
          ...(meeting ? { meeting } : {}),
        };
      });
      const shared = new Set([
        ...matchesFor(data, submission.id, now).map((m) => m.companyId),
        ...decisions.filter((d) => !challenge.companyIds.includes(d.companyId)).map((d) => d.companyId),
      ]);
      const reviewersAnswered = new Set(decisions.map((d) => `${d.companyId}:${d.reviewer.toLowerCase()}`)).size;
      return [
        {
          proof,
          original: { answer: submission.answer, explain: submission.explain },
          challenge: { id: challenge.id, title: challenge.title, minutes: challenge.minutes, format: challenge.format, kind: challenge.kind },
          seenByHumans: reviewersAnswered,
          reviewersAnswered,
          responses,
          sharedWith: [...shared].map(companyName),
          recommendedTo: (data.recommendations ?? [])
            .filter((r) => r.proofId === submission.id)
            .map((r) => ({ to: companyName(r.toCompanyId), by: r.byCity ? "the City of Espoo" : companyName(r.fromCompanyId) })),
          sharing: challenge.kind === "event" && submission.shareWithSimilar,
          pictureRemoved: submission.pictureRemoved === true,
        },
      ];
    });
}
