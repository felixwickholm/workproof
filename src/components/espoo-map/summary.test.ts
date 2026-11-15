import { describe, expect, it } from "vitest";
import { companyLine, countByCompany, countFlows, lineWeight, stageOf, stepOf, summarySentence } from "./summary";
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
    expect(countFlows(flowsOf({ sent: 15, answered: 12, scored: 10, invited: 5, met: 4 }))).toEqual({ sent: 46, scored: 31, invited: 9, met: 4 });
  });
});

describe("stageOf", () => {
  it("draws answered as scored and a meeting as an invitation", () => {
    expect(stageOf("sent")).toBe("sent");
    expect(stageOf("answered")).toBe("scored");
    expect(stageOf("scored")).toBe("scored");
    expect(stageOf("invited")).toBe("invited");
    expect(stageOf("met")).toBe("invited");
  });
});

describe("summarySentence", () => {
  it("reads the whole event in one paragraph", () => {
    expect(summarySentence(flowsOf({ sent: 15, scored: 22, invited: 5, met: 4 }))).toBe(
      "46 pieces of work went to 10 companies. 31 scored by a person. 9 invitations.",
    );
  });

  it("uses the singular for one", () => {
    expect(summarySentence([{ proofLabel: "K7", companyId: "co-halla", state: "met" }])).toBe("1 piece of work went to 1 company. 1 scored by a person. 1 invitation.");
  });

  it("says so when nothing has been handed in", () => {
    expect(summarySentence([])).toBe("No work handed in yet.");
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
    expect(totals.get("a")).toEqual({ sent: 1, scored: 1, invited: 1, met: 0 });
    expect(totals.get("b")).toEqual({ sent: 0, scored: 0, invited: 0, met: 0 });
  });
});

describe("companyLine", () => {
  it("names who took the challenge and what came of it", () => {
    expect(companyLine({ sent: 6, scored: 4, invited: 2, met: 1 })).toBe("6 people took its challenge · 4 scored · 2 invited");
    expect(companyLine({ sent: 1, scored: 0, invited: 0, met: 0 })).toBe("1 person took its challenge · 0 scored · 0 invited");
  });
});

describe("stepOf", () => {
  it("steps in thirds of the largest count", () => {
    expect([0, 3, 4, 6, 7, 9].map((n) => stepOf(n, 9))).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it("uses the first step when nothing has been sent", () => {
    expect(stepOf(0, 0)).toBe(0);
  });
});

describe("lineWeight", () => {
  it("draws three weights, heavier for more work", () => {
    const weights = [1, 5, 9].map((n) => lineWeight(n, 9));
    expect(new Set(weights).size).toBe(3);
    expect(weights).toEqual([...weights].sort((a, b) => a - b));
  });
});
