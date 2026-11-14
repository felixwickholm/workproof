import { describe, expect, it } from "vitest";
import { removeSpikes, simplifyLine, simplifyRing, simplifyRingToCount, type Point } from "./simplify";

const circle = (count: number): Point[] =>
  Array.from({ length: count }, (_, i) => [Math.cos((2 * Math.PI * i) / count) * 100, Math.sin((2 * Math.PI * i) / count) * 100] as const);

describe("simplifyLine", () => {
  it("drops points that lie on a straight line", () => {
    expect(simplifyLine([[0, 0], [1, 0], [2, 0], [3, 0]], 0.1)).toEqual([[0, 0], [3, 0]]);
  });

  it("keeps a corner further away than the tolerance", () => {
    expect(simplifyLine([[0, 0], [5, 4], [10, 0]], 1)).toEqual([[0, 0], [5, 4], [10, 0]]);
  });

  it("drops a corner within the tolerance", () => {
    expect(simplifyLine([[0, 0], [5, 0.5], [10, 0]], 1)).toEqual([[0, 0], [10, 0]]);
  });

  it("returns short lines unchanged", () => {
    expect(simplifyLine([[1, 2]], 5)).toEqual([[1, 2]]);
  });
});

describe("simplifyRing", () => {
  it("keeps the shape of a square drawn with many points", () => {
    const edge = (from: Point, to: Point): Point[] => Array.from({ length: 10 }, (_, i) => [from[0] + ((to[0] - from[0]) * i) / 10, from[1] + ((to[1] - from[1]) * i) / 10] as const);
    const square = [...edge([0, 0], [10, 0]), ...edge([10, 0], [10, 10]), ...edge([10, 10], [0, 10]), ...edge([0, 10], [0, 0])];
    expect(simplifyRing(square, 0.1)).toEqual([[0, 0], [10, 0], [10, 10], [0, 10]]);
  });
});

describe("simplifyRingToCount", () => {
  it("lands at or just under the target count", () => {
    const result = simplifyRingToCount(circle(1000), 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.length).toBeGreaterThan(30);
  });

  it("leaves a ring that is already small enough", () => {
    expect(simplifyRingToCount(circle(12), 40)).toHaveLength(12);
  });
});

describe("removeSpikes", () => {
  it("removes a needle and keeps the rest of the ring", () => {
    const ring: Point[] = [[0, 0], [10, 0], [10, 10], [5, 10], [5, 40], [4.8, 10], [0, 10]];
    expect(removeSpikes(ring, 12)).toEqual([[0, 0], [10, 0], [10, 10], [5, 10], [4.8, 10], [0, 10]]);
  });

  it("keeps ordinary corners", () => {
    expect(removeSpikes(circle(20), 12)).toHaveLength(20);
  });
});
