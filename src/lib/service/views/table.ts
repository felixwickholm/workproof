import type { TableProof } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";

/**
 * Practice proofs for the public table screen, newest first, built field by field. A row says that
 * a proof arrived and what it was for. Nothing the person wrote is in it: no work, no follow-up and
 * no count of what the blind layer hid. A first name appears only after the person accepted.
 */
export function buildTableProofs(data: StoreData): TableProof[] {
  const tasters = new Set(data.challenges.filter((c) => c.kind === "taster").map((c) => c.id));
  const invites = new Map((data.tableInvites ?? []).map((i) => [i.proofId, i]));
  return data.proofs
    .filter((p) => tasters.has(p.challengeId))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((p) => {
      const invite = invites.get(p.proofId);
      return {
        proofId: p.proofId,
        label: p.label,
        taskTitle: p.challengeTitle,
        proofKind: p.proofKind,
        submittedAt: p.submittedAt,
        ...(invite
          ? { invite: { status: invite.status, host: invite.host, ...(invite.status === "accepted" && invite.shownName ? { shownName: invite.shownName } : {}) } }
          : {}),
      };
    });
}
