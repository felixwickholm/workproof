import { describe, expect, it } from "vitest";
import { placeLabels, sidesFrom, type LabelRequest } from "./labels";

const bounds = { x: 0, y: 0, width: 200, height: 200 };
const label = (id: string, x: number, y: number, sides: LabelRequest["sides"]): LabelRequest => ({
  id,
  anchor: { x, y },
  clearances: [6],
  width: 40,
  height: 10,
  sides,
});

describe("placeLabels", () => {
  it("uses the first side that is free", () => {
    const [placed] = placeLabels([label("a", 100, 100, ["right"])], [], bounds, 2);
    expect(placed).toMatchObject({ id: "a", side: "right", x: 106, y: 95 });
  });

  it("moves to the next side when a marker is in the way", () => {
    const [placed] = placeLabels([label("a", 100, 100, ["right", "left"])], [{ x: 125, y: 100, r: 5 }], bounds, 2);
    expect(placed.side).toBe("left");
  });

  it("never lets two labels overlap", () => {
    const placed = placeLabels([label("a", 100, 100, ["right"]), label("b", 102, 102, ["right", "below"])], [], bounds, 2);
    expect(placed.map((p) => [p.id, p.side])).toEqual([
      ["a", "right"],
      ["b", "below"],
    ]);
  });

  it("leaves out a label that has no free side", () => {
    const placed = placeLabels([label("a", 100, 100, ["right"]), label("b", 100, 100, ["right"])], [], bounds, 2);
    expect(placed.map((p) => p.id)).toEqual(["a"]);
  });

  it("moves further out before giving up", () => {
    const request = { ...label("a", 100, 100, ["right"]), clearances: [6, 30] };
    const [placed] = placeLabels([request], [{ x: 115, y: 100, r: 5 }], bounds, 2);
    expect(placed.x).toBe(130);
  });

  it("places a corner label clear of a round marker", () => {
    const [placed] = placeLabels([label("a", 100, 100, ["below-right"])], [{ x: 100, y: 100, r: 5 }], bounds, 1);
    expect(placed.x).toBeCloseTo(100 + 6 * Math.SQRT1_2, 6);
    expect(placed.y).toBeCloseTo(100 + 6 * Math.SQRT1_2, 6);
  });

  it("never runs a leader line through another label", () => {
    const blocker = { ...label("b", 100, 140, ["center"]), clearances: [0] };
    const far = { ...label("a", 100, 100, ["below", "above"]), clearances: [6, 60] };
    const placed = placeLabels([blocker, far], [{ x: 100, y: 100, r: 10 }], bounds, 2);
    expect(placed.find((p) => p.id === "a")?.side).toBe("above");
  });

  it("keeps labels inside the bounds", () => {
    const [placed] = placeLabels([label("a", 190, 100, ["right", "left"])], [], bounds, 2);
    expect(placed.side).toBe("left");
  });
});

describe("sidesFrom", () => {
  it("tries the preferred side first and every side and corner once", () => {
    expect(sidesFrom("left")[0]).toBe("left");
    expect(new Set(sidesFrom("below")).size).toBe(8);
  });
});
