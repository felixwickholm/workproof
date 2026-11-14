import { describe, expect, it } from "vitest";
import { autoAdvances, isHeld, MAX_STEP_MS, MIN_STEP_MS, noHolds, remainingMs, stepDuration } from "./autoplay";
import { storySteps } from "./steps";

/** The time the story plays by itself: every step but the end card. */
const playTime = () => storySteps.slice(0, -1).reduce((sum, step) => sum + stepDuration(step), 0);

describe("stepDuration", () => {
  it("gives time to look plus a slow reader's pace, within bounds", () => {
    expect(stepDuration({ title: "x" })).toBe(MIN_STEP_MS);
    expect(stepDuration({ title: Array(60).fill("w").join(" ") })).toBe(MAX_STEP_MS);
    expect(stepDuration({ title: "one two three four five six seven eight", body: Array(16).fill("w").join(" ") })).toBe(9500);
  });

  it("gives every card of the story time to be read", () => {
    for (const step of storySteps) expect(stepDuration(step), step.id).toBeGreaterThanOrEqual(MIN_STEP_MS);
  });

  it("plays the whole story in under three minutes before the screens load", () => {
    expect(playTime()).toBeGreaterThanOrEqual(100_000);
    expect(playTime()).toBeLessThanOrEqual(160_000);
  });
});

describe("autoAdvances", () => {
  it("moves on by itself on every step but the end card", () => {
    expect(autoAdvances(0, 7, false)).toBe(true);
    expect(autoAdvances(5, 7, false)).toBe(true);
    expect(autoAdvances(6, 7, false)).toBe(false);
  });

  it("never moves on by itself with reduced motion", () => {
    expect(autoAdvances(0, 7, true)).toBe(false);
  });
});

describe("pause and resume", () => {
  it("holds for Pause, a resting mouse, keyboard focus and a hidden tab", () => {
    expect(isHeld(noHolds)).toBe(false);
    for (const key of ["paused", "hover", "focus", "hidden"] as const) expect(isHeld({ ...noHolds, [key]: true })).toBe(true);
  });

  it("resumes with what is left of the step", () => {
    expect(remainingMs(10_000, 0)).toBe(10_000);
    expect(remainingMs(10_000, 0.25)).toBe(7_500);
    expect(remainingMs(10_000, 1)).toBe(0);
    expect(remainingMs(10_000, 1.4)).toBe(0);
  });
});
