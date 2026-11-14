import type { CityTopEntry, ImpactCounts, TaskImpact } from "@/lib/domain/types";
import { plural, totalOutOf, workLabel } from "../words";

/** One step of the impact funnel: its words and its count. */
interface FunnelStep {
  key: keyof ImpactCounts;
  label: string;
  value: number;
  /**
   * The share of the step before in small words, for example "about 2 in 3". Null on the first step, and
   * when this step counts more than the one before (older work invited without a score), where a share would mislead.
   */
  share: string | null;
}

/** The six steps of the event, in order. Hires stand apart: companies tell us late, or not at all. */
const STEPS: readonly { key: Exclude<keyof ImpactCounts, "hires">; label: string }[] = [
  { key: "took", label: "Took a challenge" },
  { key: "scored", label: "Scored by a company" },
  { key: "invited", label: "Invited" },
  { key: "agreed", label: "Said yes" },
  { key: "met", label: "Talked at the event" },
  { key: "followUps", label: "Follow-up agreed" },
];

export const HIRED_LABEL = "Hired (if known)";

/**
 * A part of a whole as a plain fraction: "all", "about 2 in 3", "about 1 in 15", "none". The smallest
 * denominator up to 20 within a tenth of the true share is used; otherwise "5 of 61".
 */
export function shareInWords(part: number, whole: number): string {
  if (whole <= 0 || part <= 0) return "none";
  if (part >= whole) return "all";
  const share = part / whole;
  for (let d = 2; d <= 20; d++) {
    const n = Math.max(1, Math.round(share * d));
    if (n < d && Math.abs(n / d - share) <= share * 0.1) return `about ${n} in ${d}`;
  }
  return `${part} of ${whole}`;
}

/** The six funnel steps for an event or a task, each with its share of the step before. */
export function funnelSteps(counts: ImpactCounts): FunnelStep[] {
  return STEPS.map((step, i) => ({
    key: step.key,
    label: step.label,
    value: counts[step.key],
    share: i === 0 || counts[step.key] > counts[STEPS[i - 1].key] ? null : shareInWords(counts[step.key], counts[STEPS[i - 1].key]),
  }));
}

/** "Espoo Talent Day. 61 pieces of work done. 9 talks are agreed." Counts work, so a person with two counts twice. */
export function greeting(eventName: string, counts: ImpactCounts): string {
  if (counts.took === 0) return `${eventName}. No work is done yet.`;
  const done = `${counts.took} ${counts.took === 1 ? "piece" : "pieces"} of work done.`;
  if (counts.agreed === 0) return `${eventName}. ${done} No talk is agreed yet.`;
  return `${eventName}. ${done} ${plural(counts.agreed, "talk")} ${counts.agreed === 1 ? "is" : "are"} agreed.`;
}

/** The number the city cannot get from surveys today, in one sentence. */
export function followUpSentence(followUps: number): string {
  if (followUps === 0) return "No follow-up talk is agreed yet. Companies mark each one after the talk.";
  const talks = followUps === 1 ? "1 follow-up talk came" : `${followUps} follow-up talks came`;
  return `${talks} out of this event. Companies marked each one.`;
}

/** The challenge table's order: most work first, then most scored, then by title. */
export function sortTasks(tasks: readonly TaskImpact[]): TaskImpact[] {
  return [...tasks].sort((a, b) => b.took - a.took || b.scored - a.scored || a.title.localeCompare(b.title));
}

/** The challenges one company runs. `null` keeps them all. */
export function tasksFor(tasks: readonly TaskImpact[], companyName: string | null): TaskImpact[] {
  return companyName === null ? [...tasks] : tasks.filter((t) => t.companies.includes(companyName));
}

/** Whole days, rounded down, with at least "less than a day". */
function daysInWords(hours: number): string {
  const days = Math.floor(hours / 24);
  if (days < 1) return "less than a day";
  return plural(days, "day");
}

/**
 * The quiet state of one challenge: "3 wait for a score · oldest 2 days", "All scored", "No work yet".
 * The oldest wait is shown when known.
 */
export function taskState(task: Pick<TaskImpact, "took" | "scored">, oldestHours: number | null): string {
  if (task.took === 0) return "No work yet";
  const waiting = task.took - task.scored;
  if (waiting <= 0) return "All scored";
  const wait = `${waiting} ${waiting === 1 ? "waits" : "wait"} for a score`;
  return oldestHours === null ? wait : `${wait} · oldest ${daysInWords(oldestHours)}`;
}

/** "Work K7 · 9.0 of 10". */
export function topEntryLine(entry: Pick<CityTopEntry, "proofLabel" | "total">): string {
  return `${workLabel(entry.proofLabel)} · ${totalOutOf(entry.total)}`;
}
