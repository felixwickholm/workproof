import { describe, expect, it } from "vitest";
import { autoAdvances, isHeld, MAX_STEP_MS, MIN_STEP_MS, noHolds, remainingMs, stepDuration } from "./autoplay";
import { TOUR_KINDS, tours } from "./steps";

/** The time a tour plays by itself: every step but the end card. */
const playTime = (kind: (typeof TOUR_KINDS)[number]) => tours[kind].steps.slice(0, -1).reduce((sum, step) => sum + stepDuration(step, kind), 0);

describe("stepDuration", () => {
  it("gives time to look plus a slow reader's pace, within bounds", () => {
    expect(stepDuration({ title: "x" }, "minute")).toBe(MIN_STEP_MS);
    expect(stepDuration({ title: Array(60).fill("w").join(" ") }, "city")).toBe(MAX_STEP_MS);
    expect(stepDuration({ title: "one two three four", body: "five six seven eight" }, "minute")).toBe(7000);
    expect(stepDuration({ title: "one two three four", body: "five six seven eight" }, "seeker")).toBe(8500);
  });

  it("plays the overview in about a minute, leaving room for the screens to load", () => {
    expect(playTime("minute")).toBeGreaterThanOrEqual(40_000);
    expect(playTime("minute")).toBeLessThanOrEqual(52_000);
  });

  it.each(["seeker", "employer", "city"] as const)("plays the %s demo in 45 to 75 seconds before the screens load", (kind) => {
    expect(playTime(kind)).toBeGreaterThanOrEqual(45_000);
    expect(playTime(kind)).toBeLessThanOrEqual(75_000);
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
