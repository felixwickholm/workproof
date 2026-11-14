import type { ReviewQueue } from "@/lib/domain/types";

export type DecidedEntry = ReviewQueue["decided"][number];

/** Answered proofs, newest decision first. */
export function newestFirst(decided: readonly DecidedEntry[]): DecidedEntry[] {
  return [...decided].sort((a, b) => Date.parse(b.decision.decidedAt) - Date.parse(a.decision.decidedAt));
}
