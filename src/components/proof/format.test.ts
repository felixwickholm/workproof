import { describe, expect, it } from "vitest";
import type { Company, Skill } from "@/lib/domain/types";
import { answeredLine, clipLength, clipSkills, companyFacts, companyLine, decisionWords, hiddenLine, pooledLine, replyTime, timeAgo } from "./format";

const skill = (id: string): Skill => ({ id, label: id, why: "" });
const company = (over: Partial<Company> = {}): Company => ({
  id: "co-halla",
  name: "Halla Supply",
  blurb: "",
  sector: "Home care",
  district: "Matinkylä",
  size: "40 people",
  workLanguage: "Finnish and English",
  finnishNeeded: false,
  permitSupport: true,
  relocationHelp: false,
  ...over,
});

describe("task card lines", () => {
  it("writes reply times in plain words", () => {
    expect(replyTime(0.4)).toBe("under an hour");
    expect(replyTime(2.6)).toBe("about 3 h");
    expect(replyTime(72)).toBe("about 3 days");
  });

  it("builds the footer from what is known", () => {
    expect(answeredLine(12, 3)).toBe("12 people answered · reply in about 3 h");
    expect(answeredLine(1, null)).toBe("1 person answered");
    expect(answeredLine(0, null)).toBeNull();
    expect(answeredLine(undefined, 20)).toBe("reply in about 20 h");
  });

  it("names a pooled task only when it is pooled", () => {
    expect(pooledLine(2)).toBe("2 companies, one task");
    expect(pooledLine(1)).toBeNull();
  });
});

describe("clipSkills", () => {
  it("shows three and counts the rest", () => {
    const { shown, more } = clipSkills(["a", "b", "c", "d", "e"].map(skill));
    expect(shown.map((s) => s.id)).toEqual(["a", "b", "c"]);
    expect(more).toBe(2);
  });

  it("never counts below zero", () => {
    expect(clipSkills([skill("a")]).more).toBe(0);
  });
});

describe("companies", () => {
  it("gives one company its district and joins a pool by name", () => {
    expect(companyLine([company()])).toBe("Halla Supply · Matinkylä");
    expect(companyLine([company(), company({ name: "Otso Health" })])).toBe("Halla Supply and Otso Health");
  });

  it("writes the facts in plain yes and no", () => {
    expect(companyFacts(company()).map((f) => `${f.label}: ${f.value}`)).toEqual([
      "Work language: Finnish and English",
      "Finnish needed: no",
      "Helps with work permit: yes",
      "Helps with moving: no",
    ]);
  });
});

describe("words for people", () => {
  it("says a decision without judging", () => {
    expect(decisionWords("meet")).toBe("wants to meet you");
    expect(decisionWords("pass")).toBe("said not now, with a reason");
    expect(decisionWords("hold")).toBe("scored your work");
  });

  it("counts hidden details", () => {
    expect(hiddenLine(7)).toBe("7 details hidden before anyone read this");
    expect(hiddenLine(1)).toBe("1 detail hidden before anyone read this");
    expect(hiddenLine(0)).toBe("No personal details found to hide");
  });

  it("says how long ago", () => {
    const now = Date.parse("2026-11-14T12:00:00Z");
    expect(timeAgo("2026-11-14T11:59:40Z", now)).toBe("Just now");
    expect(timeAgo("2026-11-14T11:48:00Z", now)).toBe("12 min ago");
    expect(timeAgo("2026-11-14T09:00:00Z", now)).toBe("3 h ago");
    expect(timeAgo("2026-11-13T09:00:00Z", now)).toBe("Yesterday");
    expect(timeAgo("2026-11-10T09:00:00Z", now)).toBe("4 days ago");
  });

  it("writes a clip length", () => {
    expect(clipLength(30)).toBe("0:30");
    expect(clipLength(75)).toBe("1:15");
  });
});
