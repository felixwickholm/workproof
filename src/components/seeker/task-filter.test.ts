import { describe, expect, it } from "vitest";
import type { TaskFormat } from "@/lib/domain/types";
import { arrangeTasks, countByFormat, filterByFormat, rowFacts } from "./task-filter";

const task = (id: string, format: TaskFormat) => ({ id, challenge: { format } });
const feed = [task("a", "make"), task("b", "choose"), task("c", "make"), task("d", "fix")];

describe("challenge filter", () => {
  it("keeps the server's order and only removes", () => {
    expect(filterByFormat(feed, "all").map((t) => t.id)).toEqual(["a", "b", "c", "d"]);
    expect(filterByFormat(feed, "make").map((t) => t.id)).toEqual(["a", "c"]);
    expect(filterByFormat(feed, "read")).toEqual([]);
  });

  it("counts each format, zeros included", () => {
    expect(countByFormat(feed)).toEqual({ all: 4, choose: 1, make: 2, fix: 1, read: 0 });
  });

  it("puts open challenges first, then full ones, then the ones already done", () => {
    const list = [
      { id: "sent", placesLeft: 3, mine: true },
      { id: "full", placesLeft: 0, mine: false },
      { id: "open", placesLeft: 2, mine: false },
    ];
    const { open, full, sent } = arrangeTasks(list);
    expect([open, full, sent].map((g) => g.map((t) => t.id))).toEqual([["open"], ["full"], ["sent"]]);
  });

  it("says who, how long and how many places are left", () => {
    const base = { challenge: { minutes: 10, kind: "event" as const }, companies: [{ name: "Kaari Home Care" }], mine: false };
    expect(rowFacts({ ...base, placesLeft: 4 })).toBe("Kaari Home Care · 10 min · 4 places left");
    expect(rowFacts({ ...base, placesLeft: 1 })).toBe("Kaari Home Care · 10 min · 1 place left");
    expect(rowFacts({ ...base, placesLeft: 0 })).toBe("Kaari Home Care · 10 min");
    expect(rowFacts({ ...base, placesLeft: 4, mine: true })).toBe("Kaari Home Care · 10 min");
  });
});
