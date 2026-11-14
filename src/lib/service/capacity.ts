import type { StoreData } from "@/lib/store";
import { ServiceError } from "./support";

/** The demo keeps at most this many proofs, so one script cannot fill memory or disk. */
export const MAX_PROOFS = 500;

const isSeed = (proofId: string) => proofId.startsWith("proof_seed_");

/**
 * Frees one place when the demo is full: the oldest taster proof goes first, since no company
 * ever sees a taster. When only event proofs remain, the request is refused.
 */
export function makeRoom(data: StoreData): void {
  if (data.proofs.length < MAX_PROOFS) return;
  const tasters = new Set(data.challenges.filter((c) => c.kind === "taster").map((c) => c.id));
  const oldest = data.submissions
    .filter((s) => tasters.has(s.challengeId) && !isSeed(s.id))
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))[0];
  if (!oldest) throw new ServiceError(429, "The demo is full. Reset it from the city view.");
  data.submissions = data.submissions.filter((s) => s.id !== oldest.id);
  data.proofs = data.proofs.filter((p) => p.proofId !== oldest.id);
}
