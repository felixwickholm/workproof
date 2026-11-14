import { describe, expect, it } from "vitest";
import type { JobRole, TaskFormat } from "@/lib/domain/types";
import { activeFilters, applyFilters, filterChoices, groupByRoles, NO_FILTERS, pickedSummary, publishedLabel, roleCounts } from "./challenge-filter";

const task = (id: string, opts: { roles: JobRole[]; format?: TaskFormat; minutes?: number; company?: string; placesLeft?: number; mine?: boolean; skills?: string[] }) => ({
  id,
  challenge: {
    id,
    title: `Challenge ${id}`,
    need: "",
    roles: opts.roles,
    format: opts.format ?? "make",
    minutes: opts.minutes ?? 10,
    coreSkills: (opts.skills ?? []).map((label) => ({ id: label, label, why: "" })),
  },
  companies: [{ name: opts.company ?? "Halla Supply" }],
  placesLeft: opts.placesLeft ?? 4,
  mine: opts.mine ?? false,
});

const TASKS = [
  task("a", { roles: ["sales"], company: "Vesto", format: "choose", minutes: 5 }),
  task("b", { roles: ["ai-developer"], skills: ["Practical plan"] }),
  task("c", { roles: ["ai-developer", "software-engineer"], placesLeft: 0 }),
  task("d", { roles: ["designer"], format: "fix", minutes: 15, company: "Kuulas" }),
  task("e", { roles: ["ai-developer"], mine: true }),
];
const ids = (list: { id: string }[]) => list.map((t) => t.id);

describe("challenge filters", () => {
  it("keeps everything with no filter, in the order given", () => {
    expect(ids(applyFilters(TASKS, NO_FILTERS))).toEqual(["a", "b", "c", "d", "e"]);
    expect(activeFilters(NO_FILTERS)).toBe(0);
  });

  it("combines role, format, company and minutes", () => {
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, roles: ["ai-developer"] }))).toEqual(["b", "c", "e"]);
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, formats: ["choose", "fix"] }))).toEqual(["a", "d"]);
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, companies: ["Kuulas"] }))).toEqual(["d"]);
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, maxMinutes: 5 }))).toEqual(["a"]);
    expect(activeFilters({ ...NO_FILTERS, roles: ["sales"], maxMinutes: 10, query: " plan " })).toBe(3);
  });

  it("keeps only saved challenges when Saved is on", () => {
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, savedOnly: true }, ["d", "b"]))).toEqual(["b", "d"]);
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, savedOnly: true }))).toEqual([]);
    expect(activeFilters({ ...NO_FILTERS, savedOnly: true })).toBe(1);
  });

  it("counts the challenges per role for the role tiles", () => {
    const counts = roleCounts(TASKS);
    expect(counts.get("ai-developer")).toBe(3);
    expect(counts.get("software-engineer")).toBe(1);
    expect(counts.get("marketing")).toBeUndefined();
  });

  it("searches title, company, format, role and skill words, every word must match", () => {
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, query: "practical" }))).toEqual(["b"]);
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, query: "kuulas fix" }))).toEqual(["d"]);
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, query: "AI DEVELOPER" }))).toEqual(["b", "c", "e"]);
    expect(ids(applyFilters(TASKS, { ...NO_FILTERS, query: "kuulas sales" }))).toEqual([]);
  });

  it("puts the chosen roles first: open, then full, then sent, inside each group", () => {
    const { fits, rest } = groupByRoles(TASKS, ["ai-developer"]);
    expect(ids(fits)).toEqual(["b", "c", "e"]);
    expect(ids(rest)).toEqual(["a", "d"]);
    expect(ids(groupByRoles(TASKS, []).fits)).toEqual([]);
  });

  it("offers only the roles and companies on the list", () => {
    expect(filterChoices(TASKS)).toEqual({ roles: ["ai-developer", "software-engineer", "sales", "designer"], companies: ["Halla Supply", "Kuulas", "Vesto"] });
  });

  it("summarises a pick in a few words", () => {
    expect(pickedSummary(["Make"])).toBe("Make");
    expect(pickedSummary(["Make", "Fix"])).toBe("Make, Fix");
    expect(pickedSummary(["Make", "Fix", "Read"])).toBe("Make +2");
  });

  it("dates a challenge like a job ad, in Espoo time", () => {
    expect(publishedLabel("2026-11-13T09:00:00.000Z")).toBe("Published 13.11.");
    expect(publishedLabel("2026-11-13T23:30:00.000Z")).toBe("Published 14.11.");
    expect(publishedLabel("not a date")).toBe("");
  });
});
