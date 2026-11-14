import type { FlowMapCompany, FlowMapFlow, FlowState } from "./types";

const STATE_ORDER: Record<FlowState, number> = { sent: 0, answered: 1, invited: 2, met: 3 };

/** True when a proof reached at least the given state. A meeting also counts as answered. */
function reached(state: FlowState, atLeast: FlowState): boolean {
  return STATE_ORDER[state] >= STATE_ORDER[atLeast];
}

export interface FlowTotals {
  sent: number;
  answered: number;
  invited: number;
  met: number;
}

export function countFlows(flows: readonly FlowMapFlow[]): FlowTotals {
  return {
    sent: flows.length,
    answered: flows.filter((f) => reached(f.state, "answered")).length,
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
  if (totals.sent === 0) return "No proofs sent yet.";
  const companies = new Set(flows.map((f) => f.companyId)).size;
  return [
    `${plural(totals.sent, "proof", "proofs")} sent to ${plural(companies, "company", "companies")}.`,
    `${totals.answered} answered in writing.`,
    `${plural(totals.invited, "invitation", "invitations")}.`,
    `${plural(totals.met, "meeting", "meetings")} held.`,
  ].join(" ");
}

/** The card line for one company: "6 proofs received · 4 answered · 1 meeting". */
export function companyLine(totals: FlowTotals): string {
  return [plural(totals.sent, "proof received", "proofs received"), `${totals.answered} answered`, plural(totals.met, "meeting", "meetings")].join(" · ");
}

export type NodeSize = 0 | 1 | 2;

/**
 * Three node sizes by proofs received, relative to the busiest company, so the steps stay
 * readable whether the event has five proofs or five hundred.
 */
export function nodeSize(received: number, busiest: number): NodeSize {
  if (busiest <= 0 || received * 3 <= busiest) return 0;
  if (received * 3 <= busiest * 2) return 1;
  return 2;
}
