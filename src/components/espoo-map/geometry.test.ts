import { describe, expect, it } from "vitest";
import { curveControl, curvePath, easeInOut, fanOut, pointOnCurve, separate } from "./geometry";

describe("curveControl", () => {
  it("bows to the left of travel for a positive bend (up on screen when heading east)", () => {
    expect(curveControl({ x: 0, y: 0 }, { x: 100, y: 0 }, 0.2)).toEqual({ x: 50, y: -20 });
  });

  it("bows to the right for a negative bend", () => {
    expect(curveControl({ x: 0, y: 0 }, { x: 100, y: 0 }, -0.2)).toEqual({ x: 50, y: 20 });
  });
});

describe("curvePath", () => {
  it("writes a quadratic path with one decimal", () => {
    expect(curvePath({ x: 0, y: 0 }, { x: 50.04, y: -20 }, { x: 100, y: 0.26 })).toBe("M0 0Q50 -20 100 0.3");
  });
});

describe("pointOnCurve", () => {
  const from = { x: 0, y: 0 };
  const control = { x: 50, y: -40 };
  const to = { x: 100, y: 0 };

  it("starts and ends at the end points", () => {
    expect(pointOnCurve(from, control, to, 0)).toEqual(from);
    expect(pointOnCurve(from, control, to, 1)).toEqual(to);
  });

  it("passes halfway between the chord and the control point", () => {
    expect(pointOnCurve(from, control, to, 0.5)).toEqual({ x: 50, y: -20 });
  });
});

describe("easeInOut", () => {
  it("is slow at both ends and symmetric", () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(0.1)).toBeLessThan(0.1);
    expect(easeInOut(0.9)).toBeGreaterThan(0.9);
    expect(easeInOut(0.25) + easeInOut(0.75)).toBeCloseTo(1, 10);
  });
});

describe("fanOut", () => {
  it("keeps a single marker on the anchor", () => {
    expect(fanOut({ x: 5, y: 5 }, 1, 10, 0)).toEqual([{ x: 5, y: 5 }]);
  });

  it("spreads markers so neighbours sit exactly the spacing apart", () => {
    const points = fanOut({ x: 0, y: 0 }, 3, 12, 90);
    expect(points).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      const next = points[(i + 1) % 3];
      expect(Math.hypot(points[i].x - next.x, points[i].y - next.y)).toBeCloseTo(12, 6);
    }
  });

  it("can keep markers on one side of the anchor", () => {
    const points = fanOut({ x: 0, y: 0 }, 2, 10, 200, 70);
    expect(points.every((p) => p.x < 0.5)).toBe(true);
    expect(Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)).toBeCloseTo(10, 6);
  });

  it("starts at the given angle", () => {
    const [first] = fanOut({ x: 0, y: 0 }, 2, 10, 0);
    expect(first.x).toBeCloseTo(5, 6);
    expect(first.y).toBeCloseTo(0, 6);
  });
});

describe("separate", () => {
  it("pushes overlapping markers apart to the gap", () => {
    const [a, b] = separate([{ x: 0, y: 0, r: 5 }, { x: 4, y: 0, r: 5 }], [], 2);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(12 - 1e-6);
  });

  it("never moves a fixed marker and clears markers from it", () => {
    const fixed = { x: 0, y: 0, r: 6 };
    const [moved] = separate([{ x: 1, y: 0, r: 4 }], [fixed], 2);
    expect(fixed).toEqual({ x: 0, y: 0, r: 6 });
    expect(Math.hypot(moved.x, moved.y)).toBeGreaterThanOrEqual(12 - 1e-6);
  });

  it("gives the same answer every time, even for markers on the same spot", () => {
    const input = [{ x: 3, y: 3, r: 4 }, { x: 3, y: 3, r: 4 }, { x: 3, y: 3, r: 4 }];
    expect(separate(input, [], 1)).toEqual(separate(input, [], 1));
  });
});
