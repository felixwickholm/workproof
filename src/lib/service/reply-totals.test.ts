import { describe, expect, it } from "vitest";
import { replyTotals } from "./reply-totals";

describe("replyTotals", () => {
  const proofs = [
    { proofId: "a", submittedAt: "2026-11-14T10:00:00Z" },
    { proofId: "b", submittedAt: "2026-11-14T10:00:00Z" },
    { proofId: "c", submittedAt: "2026-11-14T10:00:00Z" },
  ];

  it("counts a proof once, however many employers answered, and times the first answer", () => {
    const totals = replyTotals(proofs, [
      { proofId: "a", decidedAt: "2026-11-14T14:00:00Z" },
      { proofId: "a", decidedAt: "2026-11-14T11:00:00Z" },
      { proofId: "b", decidedAt: "2026-11-14T13:00:00Z" },
    ]);
    expect(totals).toEqual({ proofsAnswered: 2, medianHoursToFirstAnswer: 2 });
  });

  it("ignores decisions on proofs outside the list and has no median without answers", () => {
    expect(replyTotals(proofs, [{ proofId: "x", decidedAt: "2026-11-14T11:00:00Z" }])).toEqual({ proofsAnswered: 0, medianHoursToFirstAnswer: null });
  });
});
