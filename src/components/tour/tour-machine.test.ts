import { describe, expect, it } from "vitest";
import { announcement, closedTour, counterText, tourReducer, type TourAction, type TourState } from "./tour-machine";

const STEPS = 9;
const reduce = (state: TourState, ...actions: TourAction[]) => actions.reduce((s, a) => tourReducer(s, a, STEPS), state);

/** Opens the tour and lets each move arrive with its target found. */
function settledAt(index: number): TourState {
  let state = reduce(closedTour, { type: "start" });
  state = reduce(state, { type: "arrived", run: 1, found: true });
  for (let i = 0; i < index; i++) {
    state = reduce(state, { type: "next" });
    if (!state.open) throw new Error("closed");
    state = reduce(state, { type: "arrived", run: state.run, found: true });
  }
  return state;
}

describe("tourReducer", () => {
  it("starts at the first step, preparing it out of sight", () => {
    expect(reduce(closedTour, { type: "start" })).toEqual({ open: true, kind: "minute", index: 0, pending: 0, run: 1, spotlight: false, revealed: false });
  });

  it("draws the layer when the first step arrives, or early when it is slow", () => {
    const started = reduce(closedTour, { type: "start" });
    expect(reduce(started, { type: "arrived", run: 1, found: true })).toMatchObject({ index: 0, pending: null, revealed: true });
    const early = reduce(started, { type: "reveal" });
    expect(early).toMatchObject({ index: 0, pending: 0, revealed: true });
    expect(reduce(early, { type: "reveal" })).toBe(early);
  });

  it("never repeats or skips a step when Next is pressed many times during one move", () => {
    let state = reduce(settledAt(1), { type: "next" }, { type: "next" }, { type: "next" });
    expect(state).toMatchObject({ index: 1, pending: 2 });
    const run = (state as { run: number }).run;
    state = reduce(state, { type: "arrived", run, found: true }, { type: "arrived", run, found: true });
    expect(state).toMatchObject({ index: 2, pending: null });
  });

  it("ignores a second start while open", () => {
    const open = settledAt(3);
    expect(reduce(open, { type: "start" })).toBe(open);
  });

  it("keeps the current step on the card until the next one has arrived", () => {
    const moving = reduce(settledAt(2), { type: "next" });
    expect(moving).toMatchObject({ index: 2, pending: 3 });
    expect(reduce(moving, { type: "arrived", run: (moving as { run: number }).run, found: true })).toMatchObject({ index: 3, pending: null, spotlight: true });
  });

  it("takes no second move while one is being prepared", () => {
    const moving = reduce(settledAt(2), { type: "next" });
    expect(reduce(moving, { type: "next" })).toBe(moving);
    expect(reduce(moving, { type: "back" })).toBe(moving);
  });

  it("goes back one step", () => {
    const state = reduce(settledAt(3), { type: "back" });
    expect(state).toMatchObject({ index: 3, pending: 2 });
  });

  it("stops at both ends", () => {
    const first = settledAt(0);
    expect(reduce(first, { type: "back" })).toBe(first);
    const last = settledAt(STEPS - 1);
    expect(reduce(last, { type: "next" })).toBe(last);
  });

  it("ignores the result of an abandoned move", () => {
    const moving = reduce(settledAt(1), { type: "next" });
    expect(reduce(moving, { type: "arrived", run: 1, found: true })).toBe(moving);
  });

  it("records a missing target, so the card sits in the middle", () => {
    const moving = reduce(settledAt(1), { type: "next" });
    expect(reduce(moving, { type: "arrived", run: (moving as { run: number }).run, found: false })).toMatchObject({ index: 2, spotlight: false });
  });

  it("closes from anywhere, also mid-move", () => {
    expect(reduce(reduce(settledAt(4), { type: "next" }), { type: "close" })).toEqual(closedTour);
  });

  it("does nothing while closed", () => {
    for (const action of [{ type: "next" }, { type: "back" }, { type: "arrived", run: 1, found: true }] as TourAction[]) {
      expect(reduce(closedTour, action)).toBe(closedTour);
    }
  });
});

describe("tour kinds", () => {
  const counts = { minute: 6, story: 9 };
  const go = (state: TourState, ...actions: TourAction[]) => actions.reduce((s, a) => tourReducer(s, a, counts), state);
  const arrive = (state: TourState) => go(state, { type: "arrived", run: (state as { run: number }).run, found: true });

  it("starts the one-minute walkthrough by default and the story when asked", () => {
    expect(go(closedTour, { type: "start" })).toMatchObject({ kind: "minute" });
    expect(go(closedTour, { type: "start", kind: "story" })).toMatchObject({ kind: "story" });
  });

  it("counts steps per walkthrough", () => {
    let minute = arrive(go(closedTour, { type: "start" }));
    for (let i = 0; i < 10; i++) minute = arrive(go(minute, { type: "next" }));
    expect(minute).toMatchObject({ index: 5 });
    let story = arrive(go(closedTour, { type: "start", kind: "story" }));
    for (let i = 0; i < 10; i++) story = arrive(go(story, { type: "next" }));
    expect(story).toMatchObject({ index: 8 });
  });

  it("switches from the last minute step to the story's first, keeping the card in view", () => {
    let state = arrive(go(closedTour, { type: "start" }));
    for (let i = 0; i < 5; i++) state = arrive(go(state, { type: "next" }));
    const story = go(state, { type: "start", kind: "story" });
    expect(story).toMatchObject({ open: true, kind: "story", index: 0, pending: 0, revealed: true });
    expect((story as { run: number }).run).toBeGreaterThan((state as { run: number }).run);
    // The minute walkthrough's last arrival can no longer land.
    expect(go(story, { type: "arrived", run: (state as { run: number }).run, found: true })).toBe(story);
  });
});

describe("step text", () => {
  it("counts from one", () => {
    expect(counterText(2, 9)).toBe("3 of 9");
  });

  it("announces the step with its title", () => {
    expect(announcement(2, 9, "She does the work.")).toBe("Step 3 of 9: She does the work.");
  });
});
