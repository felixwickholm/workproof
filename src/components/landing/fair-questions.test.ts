import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FAIR_QUESTIONS } from "./fair-questions";

describe("FAIR_QUESTIONS", () => {
  it("answers five questions in short answers", () => {
    expect(FAIR_QUESTIONS).toHaveLength(5);
    for (const { answer } of FAIR_QUESTIONS) expect(answer.split(/\s+/).length).toBeLessThanOrEqual(60);
  });

  it("says the same thing as the README, word for word", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    for (const { question, answer } of FAIR_QUESTIONS) {
      expect(readme).toContain(question);
      expect(readme).toContain(answer);
    }
  });
});
