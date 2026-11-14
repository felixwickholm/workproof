import { describe, expect, it } from "vitest";
import type { WishOutcome } from "@/lib/domain/types";
import { mixedWishes, PERSON_REASON, readsAsSkill, REMOVED_REASON, splitAside, wishHeadline, wishRows, withoutSkill } from "./wish-list";

const skills = [
  { id: "care-visit-planning", label: "Prioritising care visits", why: "" },
  { id: "calm-on-the-phone", label: "Calm on the phone", why: "" },
  { id: "stakeholder-communication", label: "Stakeholder communication", why: "" },
];
const setAside = ["5 years experience: the work shows ability directly", "Not used: age, native language (not skills)"];
const wishes: WishOutcome[] = [
  { text: "Plans the day when carers are off sick", outcome: "kept", skillId: "care-visit-planning" },
  { text: "Calm with families", outcome: "kept", skillId: "calm-on-the-phone" },
  { text: "age", outcome: "set-aside", reason: PERSON_REASON },
  { text: "5 years experience", outcome: "set-aside", reason: "The work shows ability directly." },
];
const reviewGuide = skills.map((s) => ({ skillId: s.id, lookFor: "Says what good work shows." }));

describe("splitAside", () => {
  it("splits the wish from its reason and makes the reason a sentence", () => {
    expect(splitAside("Driving licence: not core for this task")).toEqual({ wish: "Driving licence", reason: "Not core for this task." });
  });

  it("keeps a line without a reason whole", () => {
    expect(splitAside("Kafka")).toEqual({ wish: "Kafka", reason: "" });
  });
});

describe("wishRows", () => {
  it("shows each kept wish with the skill it became, and closes with the skills the designer added", () => {
    const { kept, aside } = wishRows({ coreSkills: skills, setAside, wishes });
    expect(kept.map((r) => [r.text, r.skillLabel])).toEqual([
      ["Plans the day when carers are off sick", "Prioritising care visits"],
      ["Calm with families", "Calm on the phone"],
      ["", "Stakeholder communication"],
    ]);
    expect(aside.map((r) => [r.text, r.reason])).toEqual([
      ["Age", PERSON_REASON],
      ["5 years experience", "The work shows ability directly."],
    ]);
    expect(new Set([...kept, ...aside].map((r) => r.key)).size).toBe(kept.length + aside.length);
  });

  it("reads a draft without per-wish outcomes from its core skills and set-aside lines", () => {
    const { kept, aside } = wishRows({ coreSkills: skills, setAside });
    expect(kept.every(readsAsSkill)).toBe(true);
    expect(aside.map((r) => r.text)).toEqual(["5 years experience", "Age", "Native language"]);
    expect(aside[1].reason).toBe(PERSON_REASON);
  });
});

describe("wishRows with facts about the job", () => {
  it("puts a work language or a licence in its own pile, never set aside", () => {
    const withFacts: WishOutcome[] = [...wishes, { text: "work language English", outcome: "fact", reason: "A fact about the job." }];
    const { kept, facts, aside } = wishRows({ coreSkills: skills, setAside, wishes: withFacts });
    expect(facts.map((r) => [r.text, r.pile])).toEqual([["Work language English", "fact"]]);
    expect(aside.map((r) => r.text)).not.toContain("Work language English");
    expect(kept.map((r) => r.text)).not.toContain("Work language English");
  });
});

describe("mixedWishes", () => {
  it("interleaves the written wishes before the sort and leaves out added skills", () => {
    const { kept, aside } = wishRows({ coreSkills: skills, setAside, wishes });
    const mixed = mixedWishes(kept, aside);
    expect(mixed).toHaveLength(4);
    expect(mixed[0].pile).toBe("aside");
    expect(mixed[1].pile).toBe("kept");
  });
});

describe("wishHeadline", () => {
  it("counts what became of the wishes", () => {
    expect(wishHeadline(3, 4)).toBe("You listed 7 wishes. 3 became core skills, 4 were set aside.");
    expect(wishHeadline(1, 0)).toBe("You listed 1 wish. 1 became a core skill.");
    expect(wishHeadline(2, 1)).toBe("You listed 3 wishes. 2 became core skills, 1 was set aside.");
  });

  it("names the facts about the job and leaves out empty piles", () => {
    expect(wishHeadline(3, 1, 2)).toBe("You listed 6 wishes. 3 became core skills, 2 are facts about the job, 1 was set aside.");
    expect(wishHeadline(2, 0, 1)).toBe("You listed 3 wishes. 2 became core skills, 1 is a fact about the job.");
    expect(wishHeadline(0, 2, 0)).toBe("You listed 2 wishes. 2 were set aside.");
  });
});

describe("withoutSkill", () => {
  it("sets aside the wishes that became the removed skill", () => {
    const draft = withoutSkill({ coreSkills: skills, setAside, wishes, reviewGuide }, "calm-on-the-phone");
    expect(draft.coreSkills.map((s) => s.id)).toEqual(["care-visit-planning", "stakeholder-communication"]);
    expect(draft.reviewGuide.map((g) => g.skillId)).toEqual(["care-visit-planning", "stakeholder-communication"]);
    expect(draft.setAside[0]).toBe("Calm on the phone: removed by you");
    expect(draft.wishes?.[1]).toEqual({ text: "Calm with families", outcome: "set-aside", reason: REMOVED_REASON });
    expect(wishRows(draft).aside.map((r) => r.text)).toContain("Calm with families");
  });
});
