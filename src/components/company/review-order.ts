import type { BlindProof, ReviewQueue } from "@/lib/domain/types";
import { newestFirst } from "./decision-words";

/**
 * The proof the review screen opens by itself: the oldest one still to read, else the first
 * Second look, else the latest answer. Arrival order only; nothing about the person or the work.
 */
export function firstToOpen(queue: Pick<ReviewQueue, "proofs" | "secondLook" | "decided">): string | null {
  return queue.proofs[0]?.proofId ?? queue.secondLook[0]?.proofId ?? newestFirst(queue.decided)[0]?.proof.proofId ?? null;
}

/**
 * The "Shared with you" rows: recommendations first, then Second look, each work once. The same work
 * can be recommended by a company and by the city, or also match on skills; it shows under its first line.
 */
export function sharedRows(queue: Pick<ReviewQueue, "recommended" | "secondLook">): { proof: BlindProof; line: string }[] {
  const rows: { proof: BlindProof; line: string }[] = [
    ...queue.recommended.map((p) => ({ proof: p, line: `Recommended by ${p.recommendedBy}` })),
    ...queue.secondLook.map((p) => ({ proof: p, line: "Shared with you. Same skills." })),
  ];
  const seen = new Set<string>();
  return rows.filter((r) => !seen.has(r.proof.proofId) && seen.add(r.proof.proofId));
}
