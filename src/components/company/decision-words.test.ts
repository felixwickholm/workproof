import { describe, expect, it } from "vitest";
import type { Decision } from "@/lib/domain/types";
import { newestFirst, type DecidedEntry } from "./decision-words";

const decision = (kind: Decision["decision"], decidedAt = "2026-11-14T08:00:00.000Z"): Decision => ({
  id: `d-${decidedAt}`,
  proofId: "p1",
  companyId: "co-kaari",
  reviewer: "Anna Koivisto",
  decision: kind,
  feedback: "You saw the blood thinner risk. I want to hear more.",
  decidedAt,
});

describe("newestFirst", () => {
  it("puts the latest decision on top without changing the input", () => {
    const entries = [
      { proof: {} as DecidedEntry["proof"], decision: decision("pass", "2026-11-13T08:00:00.000Z") },
      { proof: {} as DecidedEntry["proof"], decision: decision("meet", "2026-11-14T08:00:00.000Z") },
    ];
    expect(newestFirst(entries).map((e) => e.decision.decision)).toEqual(["meet", "pass"]);
    expect(entries[0].decision.decision).toBe("pass");
  });
});
