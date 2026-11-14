import { describe, expect, it } from "vitest";
import { countParts } from "./counts";

describe("countParts", () => {
  it("keeps the four totals in reading order, in outcome words", () => {
    expect(countParts({ took: 47, invited: 10, met: 3, automatedDecisions: 0 })).toEqual([
      { value: 47, noun: "challenges done" },
      { value: 10, noun: "people invited" },
      { value: 3, noun: "first talks" },
      { value: 0, noun: "decisions made by AI" },
    ]);
  });

  it("uses the singular for one", () => {
    expect(countParts({ took: 1, invited: 1, met: 1, automatedDecisions: 1 }).map((p) => p.noun)).toEqual([
      "challenge done",
      "person invited",
      "first talk",
      "decision made by AI",
    ]);
  });
});
