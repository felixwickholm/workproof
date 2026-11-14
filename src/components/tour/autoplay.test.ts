import { describe, expect, it } from "vitest";
import { autoAdvances, isHeld, MAX_STEP_MS, MIN_STEP_MS, noHolds, remainingMs, stepDuration } from "./autoplay";
import { minuteSteps, storySteps, tours } from "./steps";

describe("stepDuration", () => {
  it("gives about 3 words a second plus time to look, within bounds", () => {
    expect(stepDuration({ title: "x", body: "one two three" })).toBe(MIN_STEP_MS);
    expect(stepDuration({ title: "x", body: Array(60).fill("w").join(" ") })).toBe(MAX_STEP_MS);
    expect(stepDuration({ title: "x", body: Array(21).fill("w").join(" ") })).toBe(9500);
  });

  it("plays steps 1 to 5 in about 50 seconds, so the walkthrough stays near one minute", () => {
    const total = minuteSteps.slice(0, 5).reduce((sum, step) => sum + stepDuration(step), 0);
    expect(total).toBeGreaterThanOrEqual(42_000);
    expect(total).toBeLessThanOrEqual(52_000);
  });
});

describe("autoAdvances", () => {
  it("moves on by itself only in the one-minute walkthrough, before its last step", () => {
    expect(autoAdvances("minute", 0, 6, false)).toBe(true);
    expect(autoAdvances("minute", 4, 6, false)).toBe(true);
    expect(autoAdvances("minute", 5, 6, false)).toBe(false);
    expect(autoAdvances("story", 0, 9, false)).toBe(false);
  });

  it("never moves on by itself with reduced motion", () => {
    expect(autoAdvances("minute", 0, 6, true)).toBe(false);
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

describe("the one-minute walkthrough", () => {
  it("has six steps with short titles and bodies", () => {
    expect(minuteSteps).toHaveLength(6);
    for (const step of minuteSteps) {
      expect(step.title.split(/\s+/).length).toBeLessThanOrEqual(6);
      expect(step.body.split(/\s+/).length).toBeLessThanOrEqual(28);
    }
  });

  it("walks the three sides in order and ends without a spotlight", () => {
    expect(minuteSteps.map((s) => s.mode)).toEqual(["start", "seeker", "employer", "seeker", "city", "start"]);
    expect(minuteSteps[5].target).toBeUndefined();
  });

  it("never moves the story backwards", () => {
    const order = ["before", "sent", "invited", "met"];
    const stages = minuteSteps.flatMap((s) => (s.stage ? [order.indexOf(s.stage)] : []));
    expect(stages).toEqual([...stages].sort((a, b) => a - b));
  });

  it("keeps the nine-step story as the other walkthrough", () => {
    expect(tours.story.steps).toBe(storySteps);
    expect(storySteps).toHaveLength(9);
  });
});
