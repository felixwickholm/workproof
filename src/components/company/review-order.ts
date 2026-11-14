import type { ReviewQueue } from "@/lib/domain/types";
import { newestFirst } from "./decision-words";

/**
 * The proof the review screen opens by itself: the oldest one still to read, else the first
 * Second look, else the latest answer. Arrival order only; nothing about the person or the work.
 */
export function firstToOpen(queue: Pick<ReviewQueue, "proofs" | "secondLook" | "decided">): string | null {
  return queue.proofs[0]?.proofId ?? queue.secondLook[0]?.proofId ?? newestFirst(queue.decided)[0]?.proof.proofId ?? null;
}
