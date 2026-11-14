import type { FlowMapCompany, FlowMapFlow, FlowState } from "./types";

/**
 * The three ways the map draws a line: handed in (dashed), scored by a person (solid) and
 * invited to talk (accent). A meeting is drawn as an invitation.
 */
export type FlowStage = "sent" | "scored" | "invited";

export const STAGE_ORDER: readonly FlowStage[] = ["sent", "scored", "invited"];

const STATE_RANK: Record<FlowState, number> = { sent: 0, answered: 1, scored: 1, invited: 2, met: 3 };

/** The line a state is drawn as. */
export function stageOf(state: FlowState): FlowStage {
  const rank = STATE_RANK[state];
  return rank === 0 ? "sent" : rank === 1 ? "scored" : "invited";
}

/** True when a piece of work reached at least the given state. A meeting also counts as scored. */
function reached(state: FlowState, atLeast: FlowState): boolean {
  return STATE_RANK[state] >= STATE_RANK[atLeast];
}

export interface FlowTotals {
  sent: number;
  scored: number;
  invited: number;
  met: number;
}

export function countFlows(flows: readonly FlowMapFlow[]): FlowTotals {
  return {
    sent: flows.length,
    scored: flows.filter((f) => reached(f.state, "scored")).length,
    invited: flows.filter((f) => reached(f.state, "invited")).length,
    met: flows.filter((f) => reached(f.state, "met")).length,
  };
}

/** Totals for each company id, including companies that have received nothing yet. */
export function countByCompany(companies: readonly FlowMapCompany[], flows: readonly FlowMapFlow[]): Map<string, FlowTotals> {
  return new Map(companies.map((c) => [c.id, countFlows(flows.filter((f) => f.companyId === c.id))]));
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

/** The map in one paragraph, for screen readers and the image's label. */
export function summarySentence(flows: readonly FlowMapFlow[]): string {
  const totals = countFlows(flows);
  if (totals.sent === 0) return "No work handed in yet.";
  const companies = new Set(flows.map((f) => f.companyId)).size;
  return [
    `${plural(totals.sent, "piece of work went", "pieces of work went")} to ${plural(companies, "company", "companies")}.`,
    `${totals.scored} scored by a person.`,
    `${plural(totals.invited, "invitation", "invitations")}.`,
  ].join(" ");
}

/** The card line for one company: "6 people took its challenge · 4 scored · 1 invited". */
export function companyLine(totals: FlowTotals): string {
  return [plural(totals.sent, "person took its challenge", "people took its challenge"), `${totals.scored} scored`, `${totals.invited} invited`].join(" · ");
}

export type Step = 0 | 1 | 2;

/**
 * Three steps by count, relative to the largest, so the steps stay readable whether the event
 * has five pieces of work or five hundred. Used for pin sizes and line weights.
 */
export function stepOf(count: number, largest: number): Step {
  if (largest <= 0 || count * 3 <= largest) return 0;
  if (count * 3 <= largest * 2) return 1;
  return 2;
}

/** Line widths in pixels for the three steps: thin, medium, heavy. */
export const LINE_WEIGHT: Record<Step, number> = { 0: 1.25, 1: 2.25, 2: 3.5 };

/** The width in pixels of a line that carries `count` pieces of work. */
export function lineWeight(count: number, largest: number): number {
  return LINE_WEIGHT[stepOf(count, largest)];
}
