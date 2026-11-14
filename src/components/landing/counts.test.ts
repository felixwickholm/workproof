import { describe, expect, it } from "vitest";
import { countParts } from "./counts";

describe("countParts", () => {
  it("keeps the four totals in reading order, in outcome words", () => {
    expect(countParts({ proofs: 47, writtenAnswers: 31, invitations: 10, automatedDecisions: 0 })).toEqual([
      { value: 47, noun: "proofs handed in" },
      { value: 31, noun: "written reasons" },
      { value: 10, noun: "invitations" },
      { value: 0, noun: "decisions made by AI" },
    ]);
  });

  it("uses the singular for one", () => {
    expect(countParts({ proofs: 1, writtenAnswers: 1, invitations: 1, automatedDecisions: 1 }).map((p) => p.noun)).toEqual([
      "proof handed in",
      "written reason",
      "invitation",
      "decision made by AI",
    ]);
  });
});
