import type { PassportEntry } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { matchesFor } from "./queue";

/** The person's own proofs, newest first, with every human response they received. */
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
      return [
        {
          proof,
          original: { answer: submission.answer, explain: submission.explain },
          challenge: { id: challenge.id, title: challenge.title, minutes: challenge.minutes, format: challenge.format, kind: challenge.kind },
          seenByHumans: new Set(decisions.map((d) => `${d.companyId}:${d.reviewer.toLowerCase()}`)).size,
          responses,
          sharedWith: [...shared].map(companyName),
          sharing: challenge.kind === "event" && submission.shareWithSimilar,
          pictureRemoved: submission.pictureRemoved === true,
        },
      ];
    });
}
