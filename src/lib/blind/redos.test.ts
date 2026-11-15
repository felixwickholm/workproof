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
  "casual intros": "im Abc i m ".repeat(SIZE / 11),
  "here after a greeting": "hey Abc Def here ".repeat(SIZE / 17),
  "hyphenated names": "Abc-Def-Ghi ".repeat(SIZE / 12),
  "name fields": "name: Abc ".repeat(SIZE / 10),
  "sign-off marks": "/Abc br Abc t. Abc - ".repeat(SIZE / 21),
  "names with ages": "Abc Def, 34, ".repeat(SIZE / 13),
  "hidden names with ages": "[hidden] here, 34 ".repeat(SIZE / 18),
  "finnish ages": ", 34 v".repeat(SIZE / 6),
  "company prefixes": "Halla Halla ".repeat(SIZE / 12),
  "legal forms": "Nokia Oy Oy ".repeat(SIZE / 12),
  "district stems": "Kontula".repeat(SIZE / 7),
};

const KNOWN = { name: "Sanna Virtanen", contact: "+358 40 123 4567", companies: ["Halla Supply", "Tuulos Robotics"] };

describe("long adversarial input", () => {
  // A running server has every pattern compiled already; measure that state, not the first compile.
  // The engine compiles a pattern apart for one-byte and two-byte text and only after a first run,
  // so the warm-up runs twice over an ASCII sample and a sample with non-Latin letters.
  beforeAll(() => {
    const samples = ["Sanna Virtanen, sanna@example.org, 8/10. Not a young male.", "Sanna Virtanen, sanna@example.org, 王伟. Not a young male."];
    for (let round = 0; round < 2; round++) {
      for (const sample of samples) {
        blindWork(sample, [{ question: "Why?", answer: sample }], KNOWN);
        findJudgement(sample);
        protectedNames(sample);
      }
    }
  });

  it.each(Object.entries(ADVERSARIAL))("processes 50 kB of %s in under 1 s", (_, text) => {
    const start = performance.now();
    const blind = blindWork(text, [{ question: "Why?", answer: text.slice(0, 1500) }], KNOWN);
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
