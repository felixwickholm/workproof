import { TASK_FORMATS } from "@/lib/domain/kinds";
import type { TaskFormat } from "@/lib/domain/types";

/** "all" or one format. */
export type FormatFilter = "all" | TaskFormat;

/** Keeps the server's order (newest first, the same for everyone); a filter only removes. */
export function filterByFormat<T extends { challenge: { format: TaskFormat } }>(tasks: readonly T[], filter: FormatFilter): T[] {
  return filter === "all" ? [...tasks] : tasks.filter((t) => t.challenge.format === filter);
}

/** How many challenges each filter would show. */
export function countByFormat(tasks: readonly { challenge: { format: TaskFormat } }[]): Record<FormatFilter, number> {
  const counts = Object.fromEntries((["all", ...TASK_FORMATS] as const).map((k) => [k, 0])) as Record<FormatFilter, number>;
  counts.all = tasks.length;
  for (const t of tasks) counts[t.challenge.format] += 1;
  return counts;
}

interface RowTask {
  challenge: { minutes: number; kind: "event" | "taster" };
  companies: { name: string }[];
  placesLeft: number;
  mine: boolean;
}

/** "Kaari Home Care · 10 min · 4 places left". A practice challenge has no places. */
export function rowFacts(task: RowTask): string {
  const who = task.companies.map((c) => c.name).join(" and ");
  const places = task.challenge.kind === "event" && !task.mine && task.placesLeft > 0 ? `${task.placesLeft} ${task.placesLeft === 1 ? "place" : "places"} left` : null;
  return [who, `${task.challenge.minutes} min`, places].filter(Boolean).join(" · ");
}

interface Placed {
  placesLeft: number;
  mine: boolean;
}

/**
 * The list in three groups, each keeping the server's order: challenges you can start, challenges that
 * have all their answers, and challenges you already did. Nothing is ranked for the person.
 */
export function arrangeTasks<T extends Placed>(tasks: readonly T[]): { open: T[]; full: T[]; sent: T[] } {
  return {
    open: tasks.filter((t) => !t.mine && t.placesLeft > 0),
    full: tasks.filter((t) => !t.mine && t.placesLeft === 0),
    sent: tasks.filter((t) => t.mine),
  };
}
