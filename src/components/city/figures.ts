import type { CityInsights, EmployerRecord } from "@/lib/domain/types";
import { plural } from "./format";

/** The one fact the city greeting names: how many people got a written answer. */
export function answeredFact(answered: number) {
  if (answered === 0) return "No written answers yet.";
  return `${plural(answered, "person", "people")} got a written answer.`;
}

/** A bar's length as a share of the largest value in its chart, from 0 to 1. Zero for an empty chart. */
export function barShare(value: number, max: number) {
  if (max <= 0 || value <= 0) return 0;
  return Math.min(1, value / max);
}

type Demand = CityInsights["demandBySkill"][number];

/**
 * The skill whose supply is thinnest against what companies ask for: the fewest proofs per task.
 * Ties go to the skill more tasks ask for, then to the label. Null when no task asks for anything.
 */
export function thinnestSupply(demand: Demand[]): Demand | null {
  const asked = demand.filter((d) => d.tasks > 0);
  if (asked.length === 0) return null;
  return [...asked].sort((a, b) => a.proofs / a.tasks - b.proofs / b.tasks || b.tasks - a.tasks || a.label.localeCompare(b.label))[0];
}

/** The finding over the demand chart, in counts only: "Data quality: 3 tasks ask for it, 9 proofs handed in for those tasks." */
export function demandFinding(demand: Demand[]) {
  const skill = thinnestSupply(demand);
  if (!skill) return null;
  const asks = `${plural(skill.tasks, "task")} ${skill.tasks === 1 ? "asks" : "ask"} for it`;
  const those = skill.tasks === 1 ? "that task" : "those tasks";
  const handedIn = skill.proofs === 0 ? `no proof handed in for ${those} yet` : `${plural(skill.proofs, "proof")} handed in for ${those}`;
  return `${skill.label}: ${asks}, ${handedIn}.`;
}

/** Employers who owe the most answers first, then by name. Accountability, not a ranking of people. */
export function sortByOwed(employers: EmployerRecord[]) {
  return [...employers].sort((a, b) => b.proofsOwed - a.proofsOwed || a.company.name.localeCompare(b.company.name));
}

/** "47 proofs over 8 days. The busiest day had 14." Null before the first proof. */
export function arrivalsFinding(days: CityInsights["arrivalsByDay"]) {
  const total = days.reduce((sum, d) => sum + d.proofs, 0);
  if (total === 0) return null;
  const busiest = Math.max(...days.map((d) => d.proofs));
  return `${plural(total, "proof")} over ${plural(days.length, "day")}. The busiest day had ${busiest}.`;
}

/** The audit log names roles and reviewers only. A person who sent work shows as "Work seeker", never by name. */
export function auditActorName(by: string) {
  return by === "Talent" ? "Work seeker" : by;
}

/**
 * A part of a whole as a plain fraction, so a chart can say how far the work got without repeating
 * the counts the tiles already show: "all", "about 2 in 3", "about 1 in 15", "none". The smallest
 * denominator up to 20 within a tenth of the true share is used.
 */
export function shareInWords(part: number, whole: number) {
  if (whole <= 0 || part <= 0) return "none";
  if (part >= whole) return "all";
  const share = part / whole;
  for (let d = 2; d <= 20; d++) {
    const n = Math.max(1, Math.round(share * d));
    if (n < d && Math.abs(n / d - share) <= share * 0.1) return `about ${n} in ${d}`;
  }
  return `${part} of ${whole}`;
}
