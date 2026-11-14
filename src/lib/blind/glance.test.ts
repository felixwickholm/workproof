import { describe, expect, it } from "vitest";
import { atAGlance } from "./glance";

describe("at a glance", () => {
  it("describes shape only, the same way for a right and a wrong answer", () => {
    const right = atAGlance("1. Split by grasp attempt.\n2. Pick the threshold on validation.\n3. Report recall.", []);
    const wrong = atAGlance("1. Add type hints here.\n2. Rename the variables now.\n3. Use more steps.", []);
    expect(right.split(" Opens with:")[0]).toBe("3 points, 14 words.");
    expect(wrong.split(" Opens with:")[0]).toBe(right.split(" Opens with:")[0]);
    expect(right).toContain("Opens with: '1. Split by grasp attempt. 2.");
  });

  it("notes code and answered follow-ups", () => {
    const line = atAGlance("```python\nsplit = GroupShuffleSplit()\n```\nGroup by attempt id.", [
      { question: "Why?", answer: "Because frames leak." },
      { question: "If?", answer: "" },
    ]);
    expect(line).toMatch(/^1 paragraph, \d+ words\. Includes a code snippet\. Follow-up answers: 1\./);
  });
});
