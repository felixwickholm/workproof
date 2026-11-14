import { describe, expect, it } from "vitest";
import { parseSavedTry, type SavedTry } from "./try-state";

const saved: SavedTry = {
  step: "explain",
  job: "Chef",
  challenge: { id: "taster_1", title: "Plate a lunch" } as SavedTry["challenge"],
  startedAt: 1_700_000_000_000,
  answer: { text: "Separate board.", spoken: false },
  question: "Why?",
  explain: { text: "", spoken: false },
};

describe("parseSavedTry", () => {
  it("restores what was saved", () => {
    expect(parseSavedTry(JSON.stringify(saved))).toEqual(saved);
  });

  it("drops anything missing, broken or from another shape", () => {
    expect(parseSavedTry(null)).toBeNull();
    expect(parseSavedTry("{not json")).toBeNull();
    expect(parseSavedTry(JSON.stringify({ ...saved, step: "result" }))).toBeNull();
    expect(parseSavedTry(JSON.stringify({ ...saved, answer: "text" }))).toBeNull();
    expect(parseSavedTry(JSON.stringify({ ...saved, challenge: {} }))).toBeNull();
  });
});
