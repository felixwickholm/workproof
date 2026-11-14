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
    expect(reduce(closedTour, { type: "start" })).toEqual({ open: true, index: 0, pending: 0, run: 1, spotlight: false, revealed: false });
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

  it("ignores a second start for the step already shown", () => {
    const open = settledAt(3);
    expect(reduce(open, { type: "start", at: 3 })).toBe(open);
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

describe("starting at a chapter", () => {
  const STORY = 15;
  const go = (state: TourState, ...actions: TourAction[]) => actions.reduce((s, a) => tourReducer(s, a, STORY), state);
  const arrive = (state: TourState) => go(state, { type: "arrived", run: (state as { run: number }).run, found: true });

  it("starts at the beginning by default and at a chapter when asked", () => {
    expect(go(closedTour, { type: "start" })).toMatchObject({ index: 0, pending: 0 });
    expect(go(closedTour, { type: "start", at: 5 })).toMatchObject({ index: 5, pending: 5 });
  });

  it("keeps a start inside the story", () => {
    expect(go(closedTour, { type: "start", at: 99 })).toMatchObject({ index: STORY - 1 });
    expect(go(closedTour, { type: "start", at: -3 })).toMatchObject({ index: 0 });
  });

  it("glides to a chapter asked for while the card shows, keeping it in view", () => {
    const open = arrive(go(closedTour, { type: "start" }));
    const city = go(open, { type: "start", at: 10 });
    expect(city).toMatchObject({ open: true, index: 0, pending: 10, revealed: true });
    // The earlier arrival can no longer land.
    expect(go(city, { type: "arrived", run: (open as { run: number }).run, found: true })).toBe(city);
    expect(go(open, { type: "start", at: 0 })).toBe(open);
  });
});

describe("step text", () => {
  it("counts from one", () => {
    expect(counterText(2, 15)).toBe("3 of 15");
  });

  it("announces the step with its title", () => {
    expect(announcement(2, 15, "He picks a challenge.")).toBe("Step 3 of 15: He picks a challenge.");
  });
});
