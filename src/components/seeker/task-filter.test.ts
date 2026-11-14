import { describe, expect, it } from "vitest";
import { arrangeTasks } from "./task-filter";

describe("challenge groups", () => {
  it("puts open challenges first, then full ones, then the ones already done", () => {
    const list = [
      { id: "sent", placesLeft: 3, mine: true },
      { id: "full", placesLeft: 0, mine: false },
      { id: "open", placesLeft: 2, mine: false },
    ];
    const { open, full, sent } = arrangeTasks(list);
    expect([open, full, sent].map((g) => g.map((t) => t.id))).toEqual([["open"], ["full"], ["sent"]]);
  });
});
