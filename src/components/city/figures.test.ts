import { describe, expect, it } from "vitest";
import type { EmployerRecord } from "@/lib/domain/types";
import { answeredFact, arrivalsFinding, auditActorName, barShare, demandFinding, shareInWords, sortByOwed, thinnestSupply } from "./figures";

const skill = (label: string, tasks: number, proofs: number) => ({ skillId: label.toLowerCase(), label, tasks, proofs });

describe("answeredFact", () => {
  it("counts people in words that read as a sentence", () => {
    expect(answeredFact(31)).toBe("31 people got a written answer.");
    expect(answeredFact(1)).toBe("1 person got a written answer.");
    expect(answeredFact(0)).toBe("No written answers yet.");
  });
});

describe("barShare", () => {
  it("is the value against the largest value, capped at 1", () => {
    expect(barShare(10, 47)).toBeCloseTo(10 / 47);
    expect(barShare(47, 47)).toBe(1);
    expect(barShare(50, 47)).toBe(1);
  });
  it("is zero for an empty chart or a zero value", () => {
    expect(barShare(0, 47)).toBe(0);
    expect(barShare(3, 0)).toBe(0);
  });
});

describe("thinnestSupply and demandFinding", () => {
  it("names the skill with the fewest proofs per task", () => {
    const demand = [skill("Stakeholder communication", 5, 17), skill("Data quality", 3, 9), skill("Calm on the phone", 3, 13)];
    expect(thinnestSupply(demand)?.label).toBe("Data quality");
    expect(demandFinding(demand)).toBe("Data quality: 3 tasks ask for it, 9 proofs handed in for those tasks.");
  });
  it("breaks a tie by more tasks, then by label", () => {
    expect(thinnestSupply([skill("Testing", 1, 2), skill("Planning", 2, 4)])?.label).toBe("Planning");
    expect(thinnestSupply([skill("Testing", 2, 4), skill("Planning", 2, 4)])?.label).toBe("Planning");
  });
  it("says so when no proof was handed in for a skill yet, and uses the singular", () => {
    expect(demandFinding([skill("SQL", 1, 0), skill("Triage", 2, 3)])).toBe("SQL: 1 task asks for it, no proof handed in for that task yet.");
    expect(demandFinding([skill("Triage", 1, 1)])).toBe("Triage: 1 task asks for it, 1 proof handed in for that task.");
  });
  it("has no finding without demand", () => {
    expect(demandFinding([])).toBeNull();
    expect(demandFinding([skill("SQL", 0, 4)])).toBeNull();
  });
});

describe("sortByOwed", () => {
  const record = (name: string, proofsOwed: number) =>
    ({
      company: { id: name, name },
      challengeLiveDaysBeforeEvent: 1,
      proofsReceived: proofsOwed,
      proofsAnswered: 0,
      proofsOwed,
      secondLookAnswered: 0,
      medianHoursToRespond: null,
      meetingsHeld: 0,
    }) as unknown as EmployerRecord;

  it("puts the most answers owed first, then sorts by name", () => {
    const sorted = sortByOwed([record("Otso Health", 4), record("Lumo Studio", 0), record("Kaari Home Care", 4), record("Kirkas", 1)]);
    expect(sorted.map((r) => r.company.name)).toEqual(["Kaari Home Care", "Otso Health", "Kirkas", "Lumo Studio"]);
  });
  it("leaves the input untouched", () => {
    const input = [record("B", 0), record("A", 2)];
    sortByOwed(input);
    expect(input.map((r) => r.company.name)).toEqual(["B", "A"]);
  });
});

describe("arrivalsFinding", () => {
  it("sums the days and names the busiest one", () => {
    const days = [2, 5, 3, 4, 5, 7, 14, 7].map((proofs, i) => ({ day: `2026-11-${String(7 + i).padStart(2, "0")}`, proofs }));
    expect(arrivalsFinding(days)).toBe("47 proofs over 8 days. The busiest day had 14.");
  });
  it("is null before the first proof", () => {
    expect(arrivalsFinding([{ day: "2026-11-14", proofs: 0 }])).toBeNull();
  });
});

describe("auditActorName", () => {
  it("shows the person who sent work by role, and keeps reviewers and system roles", () => {
    expect(auditActorName("Talent")).toBe("Work seeker");
    expect(auditActorName("Anna Koivisto")).toBe("Anna Koivisto");
    expect(auditActorName("Blind layer")).toBe("Blind layer");
  });
});

describe("shareInWords", () => {
  it("says a share as a plain fraction", () => {
    expect(shareInWords(31, 47)).toBe("about 2 in 3");
    expect(shareInWords(10, 47)).toBe("about 1 in 5");
    expect(shareInWords(7, 47)).toBe("about 1 in 7");
    expect(shareInWords(3, 47)).toBe("about 1 in 15");
  });

  it("says all and none for the ends, and the count when no small fraction fits", () => {
    expect(shareInWords(47, 47)).toBe("all");
    expect(shareInWords(0, 47)).toBe("none");
    expect(shareInWords(3, 0)).toBe("none");
    expect(shareInWords(1, 100)).toBe("1 of 100");
  });
});
