import type { StoreData } from "@/lib/store";
import { ServiceError } from "./support";

/** The demo keeps at most this many proofs, so one script cannot fill memory or disk. */
export const MAX_PROOFS = 500;

const isSeed = (proofId: string) => proofId.startsWith("proof_seed_");

/** A proof leaves with everything that points at it, so nothing is left behind that refers to nothing. */
function removeProof(data: StoreData, proofId: string): void {
  data.submissions = data.submissions.filter((s) => s.id !== proofId);
  data.proofs = data.proofs.filter((p) => p.proofId !== proofId);
  data.decisions = data.decisions.filter((d) => d.proofId !== proofId);
  data.meetings = data.meetings.filter((m) => m.proofId !== proofId);
  if (data.tableInvites) data.tableInvites = data.tableInvites.filter((i) => i.proofId !== proofId);
}

/**
 * Frees one place when the demo is full: the oldest taster proof goes first, with its table invitation,
 * since no company ever sees a taster. When only event proofs remain, the request is refused.
 */
export function makeRoom(data: StoreData): void {
  if (data.proofs.length < MAX_PROOFS) return;
  const tasters = new Set(data.challenges.filter((c) => c.kind === "taster").map((c) => c.id));
  const oldest = data.submissions
    .filter((s) => tasters.has(s.challengeId) && !isSeed(s.id))
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))[0];
  if (!oldest) throw new ServiceError(429, "The demo is full. Reset it from the city view.");
  removeProof(data, oldest.id);
}

/** Registered reviewers one company can have in the demo. */
export const MAX_REVIEWERS = 20;

/**
 * A visitor's own pictures per store. Each can be 300 kB, and every visitor has a sandbox,
 * so this keeps the memory of one sandbox small. A written or spoken answer is always accepted.
 */
export const MAX_UPLOADED_PICTURES = 4;

export function checkPictureRoom(data: StoreData): void {
  const uploaded = data.submissions.filter((s) => s.attachment?.src.startsWith("data:")).length;
  if (uploaded >= MAX_UPLOADED_PICTURES) {
    throw new ServiceError(429, "This demo holds enough photos. Send a written or spoken answer, or reset the demo.");
  }
}
