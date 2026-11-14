import { PROOF_KINDS } from "@/lib/domain/kinds";
import type { ProofKind } from "@/lib/domain/types";

/** "all" or one kind of proof. */
export type KindFilter = "all" | ProofKind;

/** The chips in display order: All, then every kind of proof. */
export const KIND_FILTERS: readonly KindFilter[] = ["all", ...PROOF_KINDS];

/** Keeps the server's order (newest first, the same for everyone); a filter only removes. */
export function filterByKind<T extends { challenge: { proofKind: ProofKind } }>(tasks: readonly T[], filter: KindFilter): T[] {
  return filter === "all" ? [...tasks] : tasks.filter((t) => t.challenge.proofKind === filter);
}

/** How many tasks each chip would show, so an empty kind can say so before it is tapped. */
export function countByKind(tasks: readonly { challenge: { proofKind: ProofKind } }[]): Record<KindFilter, number> {
  const counts = Object.fromEntries(KIND_FILTERS.map((k) => [k, 0])) as Record<KindFilter, number>;
  counts.all = tasks.length;
  for (const t of tasks) counts[t.challenge.proofKind] += 1;
  return counts;
}

/** "14 tasks from 10 Espoo employers": employers counted once, also when they share a task. */
export function countLine(tasks: readonly { companies: { id: string }[] }[]): string {
  const employers = new Set(tasks.flatMap((t) => t.companies.map((c) => c.id))).size;
  return `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} from ${employers} Espoo ${employers === 1 ? "employer" : "employers"}`;
}

interface Placed {
  challenge: { kind: "event" | "taster"; places?: number };
  placesLeft: number;
  mine: boolean;
}

/**
 * The list in three groups, each keeping the server's order: tasks you can start, tasks that have
 * all their answers, and tasks you already sent work for. Nothing is ranked for the person.
 */
export function arrangeTasks<T extends Placed>(tasks: readonly T[]): { open: T[]; full: T[]; sent: T[] } {
  return {
    open: tasks.filter((t) => !t.mine && t.placesLeft > 0),
    full: tasks.filter((t) => !t.mine && t.placesLeft === 0),
    sent: tasks.filter((t) => t.mine),
  };
}
