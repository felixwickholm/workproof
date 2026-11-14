import { describe, expect, it } from "vitest";
import { isJobFact, jobFacts, withoutJobFacts } from "./job-facts";
import { protectedNames } from "./protected";

const FACTS: [string, string[]][] = [
  ["Finnish not required", ["Finnish not required"]],
  ["no Finnish needed", ["Finnish not required"]],
  ["Finnish is not required, work language English", ["Finnish not required", "Work language: English"]],
  ["work language English", ["Work language: English"]],
  ["working language is Swedish", ["Work language: Swedish"]],
  ["works in Finnish with customers", ["Work language: Finnish"]],
  ["fluent Finnish needed for patient contact", ["Fluent Finnish needed"]],
  ["good English", ["Good English needed"]],
  ["speaks Finnish at C1 level", ["Fluent Finnish needed"]],
  ["Finnish B1", ["Good Finnish needed"]],
  ["English required", ["English needed"]],
  ["Finnish", ["Finnish needed"]],
  ["valid Finnish nurse licence", ["Nurse licence needed"]],
  ["registered nurse license", ["Nurse licence needed"]],
  ["driving licence B", ["Driving licence B needed"]],
  ["driver's license", ["Driving licence needed"]],
  ["a driving licence is a must", ["Driving licence needed"]],
  ["work permit needed", ["Right to work in Finland needed"]],
  ["hygiene passport", ["Hygiene passport needed"]],
  ["first aid certificate", ["First aid certificate needed"]],
  ["forklift licence", ["Forklift licence needed"]],
  // Finnish and Swedish basics.
  ["suomen kieltä ei vaadita", ["Finnish not required"]],
  ["työkieli englanti", ["Work language: English"]],
  ["sujuva suomi", ["Fluent Finnish needed"]],
  ["ajokortti B", ["Driving licence B needed"]],
  ["B-ajokortti", ["Driving licence B needed"]],
  ["työlupa", ["Right to work in Finland needed"]],
  ["hygieniapassi", ["Hygiene passport needed"]],
  ["työturvallisuuskortti", ["Occupational safety card needed"]],
  ["sairaanhoitajan laillistus", ["Nurse licence needed"]],
  ["arbetsspråk engelska", ["Work language: English"]],
  ["finska krävs inte", ["Finnish not required"]],
];

const NOT_FACTS = [
  "native Finnish speaker",
  "Finnish as mother tongue",
  "API design and error handling",
  "explains medicine changes to families",
  "a driving test for the robot",
  "the license file in the repo",
  "Finnish citizen",
];

describe("job facts", () => {
  it.each(FACTS)("reads %s as %j", (text, facts) => {
    expect(jobFacts(text)).toEqual(facts);
    expect(facts.every(isJobFact)).toBe(true);
  });

  it.each(NOT_FACTS)("finds no fact in %s", (text) => {
    expect(jobFacts(text)).toEqual([]);
  });

  it("returns fixed forms only, never the words typed", () => {
    const facts = jobFacts("fluent Finnish needed for patient contact, valid Finnish nurse licence from Valvira");
    expect(facts.join(" ")).not.toMatch(/patient|Valvira|valid/i);
  });

  it("accepts only the fixed forms as publishable", () => {
    expect(isJobFact("Driving licence B needed")).toBe(true);
    expect(isJobFact("Young Finnish needed")).toBe(false);
    expect(isJobFact("Nurse licence needed, under 30")).toBe(false);
  });

  it("blanks fact phrases, so a licence never reads as a wish about the person", () => {
    expect(protectedNames("hygiene passport")).not.toEqual([]);
    expect(protectedNames(withoutJobFacts("hygiene passport"))).toEqual([]);
    expect(protectedNames(withoutJobFacts("Finnish citizen with a driving licence"))).toContain("nationality or origin");
  });

  it("reads 50 kB of repeated phrases in under 1 s", () => {
    for (const unit of ["Finnish not ", "driving licence ", "work language ", "C1 ", "nurse licence "]) {
      const text = unit.repeat(Math.ceil(50_000 / unit.length));
      const start = performance.now();
      jobFacts(text);
      withoutJobFacts(text);
      expect(performance.now() - start).toBeLessThan(1000);
    }
  });
});
