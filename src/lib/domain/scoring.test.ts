import { describe, expect, it } from "vitest";
import { orderedScores, SCORE_LEVELS, scoreProblem, totalOf } from "./scoring";

const challenge = { coreSkills: [{ id: "a", label: "A", why: "" }, { id: "b", label: "B", why: "" }, { id: "c", label: "C", why: "" }] };

describe("the fixed scoring scale", () => {
  it("has five levels from 1 to 5, each with a plain label and meaning", () => {
    expect(SCORE_LEVELS.map((l) => l.points)).toEqual([1, 2, 3, 4, 5]);
    expect(SCORE_LEVELS.map((l) => l.label)).toEqual(["Not shown", "A little", "Shown", "Shown well", "Shown well, with reasons"]);
    for (const level of SCORE_LEVELS) expect(level.meaning).toMatch(/\.$/);
  });

  it("totals out of 10 as the average × 2, one decimal", () => {
    expect(totalOf([{ points: 5 }, { points: 5 }, { points: 5 }])).toBe(10);
    expect(totalOf([{ points: 4 }, { points: 5 }, { points: 3 }])).toBe(8);
    expect(totalOf([{ points: 4 }, { points: 5 }, { points: 4 }])).toBe(8.7);
    expect(totalOf([])).toBe(0);
  });

  it("needs exactly one whole score from 1 to 5 per core skill", () => {
    const ok = [{ skillId: "a", points: 3 }, { skillId: "b", points: 1 }, { skillId: "c", points: 5 }];
    expect(scoreProblem(ok, challenge)).toBeUndefined();
    expect(scoreProblem(ok.slice(0, 2), challenge)).toMatch(/Score each of the 3 skills/);
    expect(scoreProblem([...ok.slice(0, 2), { skillId: "a", points: 2 }], challenge)).toMatch(/once/);
    expect(scoreProblem([...ok.slice(0, 2), { skillId: "x", points: 2 }], challenge)).toBeDefined();
    expect(scoreProblem([...ok.slice(0, 2), { skillId: "c", points: 6 }], challenge)).toBe("Points go from 1 to 5");
    expect(scoreProblem([...ok.slice(0, 2), { skillId: "c", points: 2.5 }], challenge)).toBe("Points go from 1 to 5");
  });

  it("puts scores in the task's own skill order", () => {
    expect(orderedScores([{ skillId: "c", points: 5 }, { skillId: "a", points: 3 }, { skillId: "b", points: 1 }], challenge).map((s) => s.skillId)).toEqual(["a", "b", "c"]);
  });
});
