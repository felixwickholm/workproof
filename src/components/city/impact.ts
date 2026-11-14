import type { CityInsights, CityTopEntry, ImpactCounts, TaskFormat, TaskImpact } from "@/lib/domain/types";
import { plural } from "./format";

/** One step of the impact funnel: its words and its count. */
export interface FunnelStep {
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

/** "Espoo Talent Day. 61 challenges done. 9 talks are agreed." Counts work, so a person with two counts twice. */
export function greeting(eventName: string, counts: ImpactCounts): string {
  if (counts.took === 0) return `${eventName}. No challenge is done yet.`;
  const done = `${plural(counts.took, "challenge")} done.`;
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

/** A total out of 10 with one decimal: "9.0". */
export function formatTotal(total: number): string {
  return total.toFixed(1);
}

/** "Work K7 · 9.0 of 10": the label stays, the word "Proof" becomes "Work". */
export function topEntryLine(entry: Pick<CityTopEntry, "proofLabel" | "total">): string {
  return `${entry.proofLabel.replace(/^Proof\b/, "Work")} · ${formatTotal(entry.total)} of 10`;
}

/** "Choose", "Make", "Fix", "Read". */
export function formatLabel(format: TaskFormat): string {
  return format.charAt(0).toUpperCase() + format.slice(1);
}

type Demand = CityInsights["demandBySkill"][number];

/** Skills most asked for, by challenges that ask, then by work handed in, then by name. */
export function sortDemand(demand: readonly Demand[]): Demand[] {
  return [...demand].sort((a, b) => b.tasks - a.tasks || b.proofs - a.proofs || a.label.localeCompare(b.label));
}

/**
 * The one finding over the demand chart: the skill most asked for, and how much work came in for it.
 * "Data analysis is asked for most: 4 challenges, 23 pieces of work." Null when nothing is asked for.
 */
export function demandFinding(demand: readonly Demand[]): string | null {
  const top = sortDemand(demand).find((d) => d.tasks > 0);
  if (!top) return null;
  const work = top.proofs === 0 ? "no work yet" : plural(top.proofs, "piece of work", "pieces of work");
  return `${top.label} is asked for most: ${plural(top.tasks, "challenge")}, ${work}.`;
}

/** A bar's length as a share of the largest value in its chart, from 0 to 1. */
export function barShare(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.min(1, value / max);
}

/** The five steps of the event, in order. */
export const EVENT_STEPS = [
  "The challenge opens before the event.",
  "The company scores the work.",
  "The top people get invited.",
  "A first talk happens at the event.",
  "A follow-up is agreed.",
] as const;

/**
 * Today's step of the event, 0 to 4. Before the event day the data says how far it got; on the day the
 * talks happen; after it, follow-ups.
 */
export function todayStep(eventDate: string, now: Date, counts: ImpactCounts): number {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(now);
  if (today > eventDate) return 4;
  if (today === eventDate) return 3;
  if (counts.invited > 0) return 2;
  if (counts.scored > 0) return 1;
  return 0;
}
