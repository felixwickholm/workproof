import { describe, expect, it } from "vitest";
import type { Challenge, Company, ImpactCounts, TaskImpact } from "@/lib/domain/types";
import { SAMPLE_ADS } from "@/lib/seed/ads";
import { companyTimelines, dayLabel, dayOf, funnelBars, lengthOf, roleOf, rolesInDemand, scoredByCompany } from "./charts";
import { madeFrom } from "./make-challenge";

const counts = (c: Partial<ImpactCounts> = {}): ImpactCounts => ({ took: 0, scored: 0, invited: 0, agreed: 0, met: 0, followUps: 0, hires: 0, ...c });

const task = (id: string, companies: string[], c: Partial<ImpactCounts> = {}): TaskImpact => ({
  challengeId: id,
  title: id,
  companies,
  topTotal: null,
  scoredShare: 0,
  ...counts(c),
});

const challenge = (id: string, companyIds: string[], need: string, createdAt: string, extra: Partial<Challenge> = {}) =>
  ({ id, companyIds, need, createdAt, kind: "event", ...extra }) as Challenge;

const company = (id: string, name: string) => ({ id, name }) as Company;

describe("lengthOf", () => {
  it("measures against the largest value and keeps zero at zero", () => {
    expect(lengthOf(5, 10)).toBe(0.5);
    expect(lengthOf(0, 10)).toBe(0);
    expect(lengthOf(3, 0)).toBe(0);
    expect(lengthOf(12, 10)).toBe(1);
  });
});

describe("funnelBars", () => {
  it("runs from challenges taken to hires, each bar against the first step", () => {
    const bars = funnelBars(counts({ took: 60, scored: 30, invited: 12, agreed: 6, met: 4, followUps: 3, hires: 2 }));
    expect(bars.map((b) => b.label)).toEqual(["Took a challenge", "Scored by a company", "Invited", "Said yes", "Talked at the event", "Follow-up agreed", "Hired (if known)"]);
    expect(bars[0].share).toBe(1);
    expect(bars[1].share).toBe(0.5);
    expect(bars[1].ofBefore).toBe("about 1 in 2");
    expect(bars[6].ofBefore).toBeNull();
  });
  it("draws nothing when no work is in", () => {
    expect(funnelBars(counts()).every((b) => b.share === 0)).toBe(true);
  });
});

describe("roleOf and rolesInDemand", () => {
  it("reads the role before the colon in the need", () => {
    expect(roleOf("Data scientist: model evaluation, data quality")).toBe("Data scientist");
    expect(roleOf("no colon here")).toBe("Other roles");
  });
  it("sums places, challenges and work per role, most places first", () => {
    const list = [
      challenge("a", ["co-a"], "Data scientist: data quality", "2026-11-08T09:00:00Z", { places: 30 }),
      challenge("b", ["co-b"], "Data scientist: statistics", "2026-11-09T09:00:00Z"),
      challenge("c", ["co-c"], "Marketing specialist: campaigns", "2026-11-09T09:00:00Z", { places: 8 }),
    ];
    const roles = rolesInDemand(list, [task("a", ["A"], { took: 5 }), task("b", ["B"], { took: 2 })]);
    expect(roles).toEqual([
      { role: "Data scientist", places: 42, challenges: 2, took: 7 },
      { role: "Marketing specialist", places: 8, challenges: 1, took: 0 },
    ]);
  });
  it("folds the tail into Other roles past the limit", () => {
    const list = ["A", "B", "C", "D"].map((r, i) => challenge(r, ["co"], `${r} role: x`, "2026-11-09T09:00:00Z", { places: 10 + i }));
    const roles = rolesInDemand(list, [], 3);
    expect(roles.map((r) => r.role)).toEqual(["D role", "C role", "Other roles"]);
    expect(roles[2].places).toBe(21);
  });
});

describe("scoredByCompany", () => {
  it("counts scored and waiting work per company, most waiting first, and leaves out companies with none", () => {
    const rows = scoredByCompany(
      [company("co-a", "Alpha"), company("co-b", "Beta"), company("co-c", "Gamma")],
      [task("t1", ["Alpha"], { took: 5, scored: 5 }), task("t2", ["Beta", "Alpha"], { took: 4, scored: 1 })],
    );
    expect(rows).toEqual([
      { companyId: "co-a", name: "Alpha", scored: 6, waiting: 3 },
      { companyId: "co-b", name: "Beta", scored: 1, waiting: 3 },
    ]);
  });
});

describe("companyTimelines", () => {
  it("puts each challenge on its Espoo day, earlier ones in their own count, earliest publisher first", () => {
    const days = ["2026-11-07", "2026-11-08", "2026-11-09"];
    const list = [
      challenge("x", ["co-b"], "R: x", "2026-11-08T22:30:00Z"),
      challenge("y", ["co-a"], "R: x", "2026-11-05T09:00:00Z"),
      challenge("z", ["co-a"], "R: x", "2026-11-07T09:00:00Z"),
    ];
    const rows = companyTimelines([company("co-a", "Alpha"), company("co-b", "Beta"), company("co-c", "Gamma")], list, [task("x", ["Beta"], { took: 4 })], days);
    expect(rows).toEqual([
      { companyId: "co-a", name: "Alpha", perDay: [1, 0, 0], earlier: 1, took: 0 },
      // 22:30 UTC on the 8th is already the 9th in Espoo.
      { companyId: "co-b", name: "Beta", perDay: [0, 0, 1], earlier: 0, took: 4 },
    ]);
  });
});

describe("dayOf and dayLabel", () => {
  it("reads days in Espoo time and names the event day", () => {
    expect(dayOf("2026-11-13T22:30:00Z")).toBe("2026-11-14");
    expect(dayOf("not a date")).toBe("");
    expect(dayLabel("2026-11-10", "2026-11-14")).toBe("Tue 10");
    expect(dayLabel("2026-11-14", "2026-11-14")).toBe("Event");
  });
});

describe("madeFrom", () => {
  it("finds the challenge the city made from a sample ad, by its stored link", () => {
    const ad = SAMPLE_ADS[0];
    const made = challenge("m", [ad.companyId], "R: x", "2026-11-09T09:00:00Z", { onBehalf: { by: "City of Espoo", adUrl: `https://example.test/ads/${ad.slug}` } });
    expect(madeFrom(ad, [challenge("n", ["co"], "R: x", "2026-11-09T09:00:00Z"), made])?.id).toBe("m");
    expect(madeFrom(ad, [])).toBeUndefined();
  });
});
