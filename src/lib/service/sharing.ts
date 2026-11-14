import { getStore } from "@/lib/store";
import { appendAudit, findOrThrow, ServiceError } from "./support";

/**
 * Turns Second look on or off for one proof. Only the author can do it, with their talent id.
 * Off removes the proof from every Second look queue; decisions already made stay.
 */
export async function setSharing(proofId: string, talentId: string, share: boolean): Promise<{ proofId: string; sharing: boolean }> {
  return getStore().update((data) => {
    const submission = findOrThrow(data.submissions, (s) => s.id === proofId, "Proof");
    if (submission.talentId !== talentId) throw new ServiceError(403, "Only the person who wrote this proof can change who sees it");
    const challenge = data.challenges.find((c) => c.id === submission.challengeId);
    if (challenge?.kind !== "event") throw new ServiceError(409, "A practice proof is never shown to employers");
    if (submission.shareWithSimilar !== share) {
      submission.shareWithSimilar = share;
      const label = data.proofs.find((p) => p.proofId === proofId)?.label ?? "A proof";
      appendAudit(data, {
        actor: "human",
        by: "Talent",
        action: share ? "Recorded consent" : "Withdrew consent",
        detail: share
          ? `${label} may be shown to other employers with the same core skills if the first employer says not now or does not answer in time.`
          : `${label} is no longer shown through Second look. Decisions already made stay.`,
      });
    }
    return { proofId, sharing: submission.shareWithSimilar };
  });
}
