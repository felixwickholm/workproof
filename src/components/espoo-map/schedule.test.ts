import { describe, expect, it } from "vitest";
import { dotSchedule, inFlightAt, MAX_IN_FLIGHT, type Trip } from "./schedule";

const trips: Trip[] = Array.from({ length: 47 }, (_, i) => ({ key: `P${i}:co-${i % 10}`, seconds: 2.8 + (i % 5) * 0.3 }));

describe("dotSchedule", () => {
  it("never has more than six dots on their way at once", () => {
    const schedule = dotSchedule(trips);
    let most = 0;
    for (let t = 0; t < schedule.period * 2; t += 0.01) most = Math.max(most, inFlightAt(trips, schedule, t));
    expect(most).toBeLessThanOrEqual(MAX_IN_FLIGHT);
    expect(most).toBeGreaterThanOrEqual(MAX_IN_FLIGHT - 1);
  });

  it("gives every dot its own start, on an even beat", () => {
    const offsets = [...dotSchedule(trips).offsets.values()].sort((a, b) => a - b);
    expect(new Set(offsets).size).toBe(trips.length);
    const beats = offsets.slice(1).map((o, i) => o - offsets[i]);
    for (const beat of beats) expect(beat).toBeCloseTo(beats[0], 9);
  });

  it("is stable whatever order the trips arrive in", () => {
    const a = dotSchedule(trips);
    const b = dotSchedule([...trips].reverse());
    expect([...b.offsets.entries()].sort()).toEqual([...a.offsets.entries()].sort());
  });

  it("keeps a short event in one calm loop", () => {
    const few = trips.slice(0, 3);
    const schedule = dotSchedule(few);
    expect(schedule.period).toBeGreaterThan(Math.max(...few.map((t) => t.seconds)));
    expect(dotSchedule([]).offsets.size).toBe(0);
  });
});
