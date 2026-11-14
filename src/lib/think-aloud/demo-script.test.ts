import { describe, expect, it } from "vitest";
import { scriptFromProof } from "./demo-script";

const thinkAloud = { transcript: "I read the table first.", seconds: 312 };

describe("demo script from seeded work", () => {
  it("needs a think-aloud to play", () => {
    expect(scriptFromProof({ format: "make" }, { work: "x" })).toBeNull();
  });

  it("plays a Choose pick with the note only", () => {
    const script = scriptFromProof({ format: "choose" }, { work: "I pick B: The school.\n\nIt opens first.", choice: "b", thinkAloud });
    expect(script).toEqual({ format: "choose", transcript: thinkAloud.transcript, answer: "It opens first.", choice: "b", mark: undefined, seconds: 312 });
  });

  it("marks the same part in a Fix and types only the fix", () => {
    const material = { kind: "text" as const, title: "Budget", body: "Item    Jan    Feb\nTravel  12 000  42 000" };
    const script = scriptFromProof({ format: "fix", material }, { work: "What is wrong: Travel: 42 000\n\nThe fix: It should be 24 000.", thinkAloud });
    expect(script?.mark).toBe(5);
    expect(script?.answer).toBe("It should be 24 000.");
  });

  it("types the one thing in a Read, and cuts a long Make answer", () => {
    expect(scriptFromProof({ format: "read" }, { work: "The one thing: Mondays drop.\n\nWhat I would check next: holidays", thinkAloud })?.answer).toBe("Mondays drop.");
    const long = scriptFromProof({ format: "make" }, { work: "word ".repeat(100), thinkAloud });
    expect(long!.answer.length).toBeLessThanOrEqual(221);
    expect(long!.answer.endsWith("…")).toBe(true);
  });
});
