import type { Challenge, OwnProof } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { replyTotals } from "../reply-totals";

export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;

/** Published event tasks: what talent can see and companies can be judged on. Tasters are practice only. */
export function eventChallenges(data: StoreData): Challenge[] {
  return data.challenges.filter((c) => c.kind === "event" && Boolean(c.approvedBy));
}

/** Proofs handed in for published event tasks. */
export function eventProofs(data: StoreData): OwnProof[] {
  const ids = new Set(eventChallenges(data).map((c) => c.id));
  return data.proofs.filter((p) => ids.has(p.challengeId));
}

/** Did people get an answer, and how fast? The same numbers for the city and every employer. */
export function eventTotals(data: StoreData): { proofs: number; proofsAnswered: number; medianHoursToFirstAnswer: number | null } {
  const proofs = eventProofs(data);
  return { proofs: proofs.length, ...replyTotals(proofs, data.decisions) };
}

/** Hours between two ISO times, one decimal, never negative. */
export function hoursBetween(from: string, to: string): number {
  return Math.round(Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / HOUR_MS) * 10) / 10;
}
