import { fitsRoles, JOB_ROLES, ROLE_LABEL, rolesOf } from "@/lib/domain/roles";
import type { Challenge, JobRole, TaskFormat } from "@/lib/domain/types";
import { FORMAT_LABEL } from "../words";
import { arrangeTasks } from "./task-filter";

/** What the filter bar holds. Empty lists and a null limit mean "any". */
export interface ChallengeFilters {
  roles: JobRole[];
  formats: TaskFormat[];
  companies: string[];
  maxMinutes: number | null;
  query: string;
  /** Only the challenges this visitor saved on this device. */
  savedOnly: boolean;
}

export const NO_FILTERS: ChallengeFilters = { roles: [], formats: [], companies: [], maxMinutes: null, query: "", savedOnly: false };

/** The time limits a person can pick. Seeded challenges take 8 to 30 minutes. */
export const MINUTE_LIMITS = [10, 15, 30] as const;

interface FilterTask {
  challenge: Pick<Challenge, "id" | "title" | "need" | "roles" | "format" | "minutes" | "coreSkills">;
  companies: { name: string }[];
  placesLeft: number;
  mine: boolean;
}

/** How many filters are set; the search box counts as one. */
export function activeFilters(filters: ChallengeFilters): number {
  return [filters.roles.length, filters.formats.length, filters.companies.length, filters.maxMinutes ?? 0, filters.query.trim().length, filters.savedOnly].filter(Boolean).length;
}

/** Every word a person might search a challenge by: its title, companies, format, roles and skills. */
function searchText(task: FilterTask): string {
  const { challenge } = task;
  return [
    challenge.title,
    ...task.companies.map((c) => c.name),
    FORMAT_LABEL[challenge.format],
    ...rolesOf(challenge).map((r) => ROLE_LABEL[r]),
    ...challenge.coreSkills.map((s) => s.label),
  ]
    .join(" ")
    .toLowerCase();
}

/** Keeps the challenges that pass every filter, in the order given. A filter only removes. `saved` holds the saved challenge ids. */
export function applyFilters<T extends FilterTask>(tasks: readonly T[], filters: ChallengeFilters, saved: readonly string[] = []): T[] {
  const words = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  return tasks.filter((task) => {
    const { challenge } = task;
    if (filters.roles.length && !fitsRoles(challenge, filters.roles)) return false;
    if (filters.formats.length && !filters.formats.includes(challenge.format)) return false;
    if (filters.companies.length && !task.companies.some((c) => filters.companies.includes(c.name))) return false;
    if (filters.maxMinutes !== null && challenge.minutes > filters.maxMinutes) return false;
    if (filters.savedOnly && !saved.includes(challenge.id)) return false;
    if (words.length) {
      const text = searchText(task);
      if (!words.every((w) => text.includes(w))) return false;
    }
    return true;
  });
}

/**
 * Splits the list into challenges for the person's chosen roles and the rest. Inside each group the
 * ones you can start come first, then full ones, then ones you did, each in the server's order (newest
 * first). This orders challenges for the person's own pick; it never orders people.
 */
export function groupByRoles<T extends FilterTask>(tasks: readonly T[], chosen: readonly JobRole[]): { fits: T[]; rest: T[] } {
  const flat = (list: T[]) => {
    const { open, full, sent } = arrangeTasks(list);
    return [...open, ...full, ...sent];
  };
  return {
    fits: flat(tasks.filter((t) => fitsRoles(t.challenge, chosen))),
    rest: flat(tasks.filter((t) => !fitsRoles(t.challenge, chosen))),
  };
}

/** How many challenges on the list fit each role, for the role tiles. A challenge for two roles counts for both. */
export function roleCounts(tasks: readonly FilterTask[]): Map<JobRole, number> {
  const counts = new Map<JobRole, number>();
  for (const task of tasks) for (const role of rolesOf(task.challenge)) counts.set(role, (counts.get(role) ?? 0) + 1);
  return counts;
}

/** The choices each filter offers, from the challenges on the list: roles in display order, companies A to Z. */
export function filterChoices(tasks: readonly FilterTask[]): { roles: JobRole[]; companies: string[] } {
  const present = new Set(tasks.flatMap((t) => rolesOf(t.challenge)));
  const companies = [...new Set(tasks.flatMap((t) => t.companies.map((c) => c.name)))].sort((a, b) => a.localeCompare(b, "fi"));
  return { roles: JOB_ROLES.filter((r) => present.has(r)), companies };
}

/** "Make, Fix" or "AI developer +2": what a filter pill says once something is picked. */
export function pickedSummary(labels: readonly string[]): string {
  if (labels.length <= 2) return labels.join(", ");
  return `${labels[0]} +${labels.length - 1}`;
}

const DAY_MONTH = new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "numeric", timeZone: "Europe/Helsinki" });

/** "Published 13.11.": the Finnish day and month in Espoo's time, the way a job board dates an ad. */
export function publishedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const text = DAY_MONTH.format(date);
  return `Published ${text.endsWith(".") ? text : `${text}.`}`;
}
