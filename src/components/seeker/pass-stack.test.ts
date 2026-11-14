import { describe, expect, it } from "vitest";
import { stackLayout, stackOrder } from "./pass-stack";

describe("pass stack", () => {
  it("keeps the order with the last pass in front", () => {
    expect(stackOrder(3, 2)).toEqual([0, 1, 2]);
    expect(stackLayout(3, 2)).toEqual({ tops: [0, 64, 128], height: 128 + 220 });
  });

  it("brings a chosen pass to the front and keeps the others in order behind it", () => {
    expect(stackOrder(4, 1)).toEqual([0, 2, 3, 1]);
    expect(stackLayout(3, 0)).toEqual({ tops: [128, 0, 64], height: 128 + 220 });
  });

  it("keeps the same height whichever pass is in front", () => {
    expect(stackLayout(3, 0).height).toBe(stackLayout(3, 2).height);
  });

  it("is empty without passes", () => {
    expect(stackLayout(0, 0)).toEqual({ tops: [], height: 0 });
  });
});
