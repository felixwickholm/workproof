import { beforeAll, describe, expect, it } from "vitest";
import { findJudgement } from "@/lib/guard/no-judgement";
import { protectedNames } from "@/lib/guard/protected";
import { blindWork } from "./blind-work";
import { atAGlance } from "./glance";

const SIZE = 50_000;
const ADVERSARIAL: Record<string, string> = {
  cjk: "王".repeat(SIZE),
  digits: "4".repeat(SIZE),
  "spaced digits": "1 ".repeat(SIZE / 2),
  "at runs": "at ".repeat(SIZE / 3),
  "nested brackets": "[(".repeat(SIZE / 4) + ")]".repeat(SIZE / 4),
  "dotted words": "a.".repeat(SIZE / 2),
  "hyphen words": "a-".repeat(SIZE / 2),
  "capital words": "Abc ".repeat(SIZE / 4),
};

describe("long adversarial input", () => {
  // A running server has every pattern compiled already; measure that state, not the first compile.
  beforeAll(() => {
    const sample = "Sanna Virtanen, sanna@example.org, 王伟. Not a young male.";
    blindWork(sample, [{ question: "Why?", answer: sample }], { name: "Sanna Virtanen", contact: "+358 40 123 4567" });
    findJudgement(sample);
    protectedNames(sample);
  });

  it.each(Object.entries(ADVERSARIAL))("processes 50 kB of %s in under 1 s", (_, text) => {
    const start = performance.now();
    const blind = blindWork(text, [{ question: "Why?", answer: text.slice(0, 1500) }], { name: "Sanna Virtanen", contact: "+358 40 123 4567" });
    atAGlance(blind.work, blind.explain);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it.each(Object.entries(ADVERSARIAL))("checks 50 kB of %s with the guards in under 1 s", (_, text) => {
    const start = performance.now();
    findJudgement(text);
    protectedNames(text);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});
