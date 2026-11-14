import { describe, expect, it } from "vitest";
import { decisionInputProblem, looksLikeSoftware, reviewerNameProblem } from "./decision-rules";
import { NAMED_PERSON_NEEDED } from "./guardrails";

const FEEDBACK = "Clear plan for the evening visits. We would like to talk.";

describe("reviewer names", () => {
  it.each(["Anna Koivisto", "Li", "Jean-Luc Picard", "Åsa Öberg", "Aiko Tanaka", "Botond Kiss", "Automaa Virtanen", "Modeste Diallo"])("accepts the person %s", (name) => {
    expect(reviewerNameProblem(name)).toBeUndefined();
    expect(decisionInputProblem(name, FEEDBACK)).toBeUndefined();
  });

  it.each(["AI bot", "ai", "Review Bot", "auto-review", "System", "GPT reviewer", "Scoring model", "script 2", "Workprint AI"])("refuses software named %s", (name) => {
    expect(looksLikeSoftware(name)).toBe(true);
    expect(reviewerNameProblem(name)).toBe(NAMED_PERSON_NEEDED);
    expect(decisionInputProblem(name, FEEDBACK)).toBe(NAMED_PERSON_NEEDED);
  });

  it.each(["", "A", ".", "--", "x".repeat(81)])("refuses %j as a name", (name) => {
    expect(reviewerNameProblem(name)).toBe(NAMED_PERSON_NEEDED);
  });
});
