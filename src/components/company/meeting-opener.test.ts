import { describe, expect, it } from "vitest";
import { openerAnswer } from "./meeting-opener";

const typed = { question: "Why the insulin visit first?", answer: "It cannot move." };
const spoken = { question: "What would you change?", answer: "The blood thinner comes first.", spoken: true };

describe("openerAnswer", () => {
  it("prefers the first spoken answer", () => {
    expect(openerAnswer([typed, spoken])).toBe(spoken);
  });

  it("falls back to the first answer, and to nothing without answers", () => {
    expect(openerAnswer([typed, { ...typed, answer: "Second." }])).toBe(typed);
    expect(openerAnswer([])).toBeNull();
  });
});
