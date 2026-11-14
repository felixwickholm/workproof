import { describe, expect, it } from "vitest";
import { buildCityOverview, employerRecord } from "./city";
import { IDENTITY, sampleEvent } from "./test-data";

describe("city insights", () => {
  const overview = buildCityOverview(sampleEvent());
  const { insights } = overview;

  it("ranks demand by tasks, then label, and splits work by proof kind", () => {
    expect(insights.demandBySkill.map((s) => [s.label, s.tasks, s.proofs])).toEqual([
      ["Communication", 2, 3],
      ["Planning", 2, 3],
      ["Triage", 2, 3],
      ["Plain language", 1, 1],
      ["SQL", 1, 1],
      ["Testing", 1, 1],
    ]);
    expect(insights.byProofKind).toEqual([
      { kind: "writing", tasks: 1, proofs: 1 },
      { kind: "plan", tasks: 1, proofs: 2 },
      { kind: "code", tasks: 1, proofs: 1 },
    ]);
    expect(insights.pooled).toEqual([{ challengeId: "ch-pool", title: "Task ch-pool", companies: ["Kaari Home Care", "Kivira Labs"], proofs: 1 }]);
  });

  it("keeps the funnel, fairness record and readiness from the data", () => {
    expect(insights.funnel).toEqual({ proofs: 4, answered: 3, invited: 2, accepted: 1, met: 1 });
    expect(insights.fairness).toEqual({
      automatedDecisions: 0,
      detailsHidden: 10,
      decisionsWithNamedHuman: 3,
      decisionsWithFeedback: 3,
      secondLookConsents: 2,
      namesShownAfterAccept: 1,
      wishesSetAside: 2,
    });
    expect(insights.readiness).toEqual({ tasks: 3, liveThreeDaysBefore: 2 });
    expect(overview.totals.proofs).toBe(insights.funnel.proofs);
  });

  it("shows each proof at its furthest step, oldest first", () => {
    expect(insights.flows).toEqual([
      { proofLabel: "Proof P3", companyId: "co-kaari", state: "met" },
      { proofLabel: "Proof P2", companyId: "co-otso", state: "answered" },
      { proofLabel: "Proof P1", companyId: "co-kaari", state: "invited" },
      { proofLabel: "Proof P4", companyId: "co-kaari", state: "sent" },
    ]);
  });

  it("counts arrivals per day for the 8 days up to the event, zero-filled", () => {
    expect(insights.arrivalsByDay).toEqual([
      { day: "2026-11-07", proofs: 0 },
      { day: "2026-11-08", proofs: 0 },
      { day: "2026-11-09", proofs: 0 },
      { day: "2026-11-10", proofs: 0 },
      { day: "2026-11-11", proofs: 1 },
      { day: "2026-11-12", proofs: 1 },
      { day: "2026-11-13", proofs: 1 },
      { day: "2026-11-14", proofs: 1 },
    ]);
  });

  it("carries no talent id, name or contact", () => {
    const text = JSON.stringify(overview);
    for (const value of IDENTITY) expect(text).not.toContain(value);
  });

  it("keeps each employer's own-task counts apart from its Second look answers", () => {
    const data = sampleEvent();
    // Otso answers Kaari's proof P1 through Second look: that never counts as one of Otso's own proofs.
    data.decisions.push({ id: "d4", proofId: "p1", companyId: "co-otso", reviewer: "Henrik Lund", decision: "pass", feedback: "Clear plan; our roles need a nurse licence.", decidedAt: "2026-11-14T11:00:00.000Z" });
    const record = (id: string) => {
      const { company, ...counts } = employerRecord(data, data.companies.find((c) => c.id === id)!);
      return { id: company.id, ...counts };
    };
    expect(record("co-kaari")).toMatchObject({ proofsReceived: 3, proofsAnswered: 2, proofsOwed: 1, secondLookAnswered: 0, medianHoursToRespond: 19, meetingsHeld: 1 });
    expect(record("co-otso")).toMatchObject({ proofsReceived: 1, proofsAnswered: 1, proofsOwed: 0, secondLookAnswered: 1, medianHoursToRespond: 20 });
    expect(record("co-kivira")).toMatchObject({ proofsReceived: 1, proofsAnswered: 0, proofsOwed: 1, secondLookAnswered: 0, medianHoursToRespond: null });
    for (const r of buildCityOverview(data).employers) {
      expect(r.proofsAnswered + r.proofsOwed).toBe(r.proofsReceived);
    }
  });
});
