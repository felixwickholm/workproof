import { describe, expect, it } from "vitest";
import { companyLine, countByCompany, countFlows, nodeSize, summarySentence } from "./summary";
import type { FlowMapFlow, FlowState } from "./types";

function flowsOf(counts: Partial<Record<FlowState, number>>, companies = 10): FlowMapFlow[] {
  const flows: FlowMapFlow[] = [];
  for (const [state, count] of Object.entries(counts) as [FlowState, number][]) {
    for (let i = 0; i < count; i++) flows.push({ proofLabel: `${state}${i}`, companyId: `co-${flows.length % companies}`, state });
  }
  return flows;
}

describe("countFlows", () => {
  it("counts each state together with the states after it", () => {
    expect(countFlows(flowsOf({ sent: 15, answered: 22, invited: 5, met: 4 }))).toEqual({ sent: 46, answered: 31, invited: 9, met: 4 });
  });
});

describe("summarySentence", () => {
  it("reads the whole event in one paragraph", () => {
    expect(summarySentence(flowsOf({ sent: 15, answered: 22, invited: 5, met: 4 }))).toBe(
      "46 proofs sent to 10 companies. 31 answered in writing. 9 invitations. 4 meetings held.",
    );
  });

  it("uses the singular for one", () => {
    expect(summarySentence([{ proofLabel: "K7", companyId: "co-kaari", state: "met" }])).toBe(
      "1 proof sent to 1 company. 1 answered in writing. 1 invitation. 1 meeting held.",
    );
  });

  it("says so when nothing has been sent", () => {
    expect(summarySentence([])).toBe("No proofs sent yet.");
  });
});

describe("countByCompany", () => {
  it("includes companies that received nothing", () => {
    const totals = countByCompany(
      [
        { id: "a", name: "A", sector: "x", district: "Kera" },
        { id: "b", name: "B", sector: "x", district: "Kera" },
      ],
      [{ proofLabel: "A1", companyId: "a", state: "invited" }],
    );
    expect(totals.get("a")).toEqual({ sent: 1, answered: 1, invited: 1, met: 0 });
    expect(totals.get("b")).toEqual({ sent: 0, answered: 0, invited: 0, met: 0 });
  });
});

describe("companyLine", () => {
  it("names what the company received and what came of it", () => {
    expect(companyLine({ sent: 6, answered: 4, invited: 2, met: 1 })).toBe("6 proofs received · 4 answered · 1 meeting");
    expect(companyLine({ sent: 1, answered: 0, invited: 0, met: 0 })).toBe("1 proof received · 0 answered · 0 meetings");
  });
});

describe("nodeSize", () => {
  it("steps in thirds of the busiest company", () => {
    expect(nodeSize(0, 9)).toBe(0);
    expect(nodeSize(3, 9)).toBe(0);
    expect(nodeSize(4, 9)).toBe(1);
    expect(nodeSize(6, 9)).toBe(1);
    expect(nodeSize(7, 9)).toBe(2);
    expect(nodeSize(9, 9)).toBe(2);
  });

  it("uses the smallest size when nothing has been sent", () => {
    expect(nodeSize(0, 0)).toBe(0);
  });
});
