import { describe, expect, it } from "vitest";
import type { AuditEvent } from "@/lib/domain/types";
import { countAutomatedDecisions } from "./automated";
import { buildCityOverview } from "./city";
import { sampleEvent } from "./test-data";

const line = (actor: AuditEvent["actor"], action: string): AuditEvent => ({ id: `a-${actor}-${action}`, at: "2026-11-14T10:00:00.000Z", actor, by: "x", action, detail: "" });

describe("automated decisions are counted, not assumed", () => {
  it("is 0 when every decision names a registered person and every decision line is by a human", () => {
    const data = sampleEvent();
    data.audit.push(line("human", "Chose to meet"), line("ai", "Drafted a Problem Card"), line("system", "Sent a meeting invite"));
    expect(countAutomatedDecisions(data)).toBe(0);
    expect(buildCityOverview(data).totals.automatedDecisions).toBe(0);
  });

  it("counts a decision line written by anything but a human", () => {
    const data = sampleEvent();
    data.audit.push(line("ai", "Chose to meet"), line("system", "Said not now, with a reason"));
    expect(countAutomatedDecisions(data)).toBe(2);
    const overview = buildCityOverview(data);
    expect(overview.totals.automatedDecisions).toBe(2);
    expect(overview.insights.fairness.automatedDecisions).toBe(2);
  });

  it("counts a stored decision whose reviewer is not registered for that company", () => {
    const data = sampleEvent();
    data.decisions[0] = { ...data.decisions[0], reviewer: "AI bot" };
    data.decisions[1] = { ...data.decisions[1], companyId: "co-unknown" };
    expect(countAutomatedDecisions(data)).toBe(2);
  });
});
