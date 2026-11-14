import { describe, expect, it } from "vitest";
import type { ProofKind } from "@/lib/domain/types";
import { arrangeTasks, countByKind, countLine, filterByKind, KIND_FILTERS } from "./task-filter";

const task = (id: string, proofKind: ProofKind) => ({ id, challenge: { proofKind } });
const feed = [task("a", "plan"), task("b", "photo"), task("c", "plan"), task("d", "code")];

describe("task filter", () => {
  it("offers All and every kind of proof, in display order", () => {
    expect(KIND_FILTERS).toEqual(["all", "writing", "plan", "photo", "video", "voice", "design", "code"]);
  });

  it("keeps the server's order and only removes", () => {
    expect(filterByKind(feed, "all").map((t) => t.id)).toEqual(["a", "b", "c", "d"]);
    expect(filterByKind(feed, "plan").map((t) => t.id)).toEqual(["a", "c"]);
    expect(filterByKind(feed, "video")).toEqual([]);
  });

  it("counts each chip, zeros included", () => {
    const counts = countByKind(feed);
    expect(counts.all).toBe(4);
    expect(counts.plan).toBe(2);
    expect(counts.video).toBe(0);
  });
});

describe("count line", () => {
  it("counts each employer once, also on a shared task", () => {
    const tasks = [{ companies: [{ id: "a" }] }, { companies: [{ id: "a" }, { id: "b" }] }];
    expect(countLine(tasks)).toBe("2 tasks from 2 Espoo employers");
    expect(countLine([{ companies: [{ id: "a" }] }])).toBe("1 task from 1 Espoo employer");
  });
});

describe("arrange tasks", () => {
  const placed = (id: string, placesLeft: number, mine = false) => ({ id, challenge: { kind: "event" as const }, placesLeft, mine });

  it("puts full tasks after open ones and work already sent last, keeping the order inside each group", () => {
    const { open, full, sent } = arrangeTasks([placed("a", 0), placed("b", 4), placed("c", 2, true), placed("d", 1), placed("e", 0, true)]);
    expect(open.map((t) => t.id)).toEqual(["b", "d"]);
    expect(full.map((t) => t.id)).toEqual(["a"]);
    expect(sent.map((t) => t.id)).toEqual(["c", "e"]);
  });
});
