import { describe, expect, it } from "vitest";
import type { WishOutcome } from "@/lib/domain/types";
import { draftProblems } from "@/lib/guard/check-draft";
import { PROTECTED_NAMES, protectedNames } from "@/lib/guard/protected";
import { draftFromNeed } from "./compose";
import { EXPERIENCE_REASON, EXTRA_REASON, FACT_REASON, NATIVE_REASON, PERSON_REASON, wishOutcomes } from "./wish-outcomes";

const kept = (text: string, skillId: string): WishOutcome => ({ text, outcome: "kept", skillId });
const aside = (text: string, reason: string): WishOutcome => ({ text, outcome: "set-aside", reason });
const fact = (text: string): WishOutcome => ({ text, outcome: "fact", reason: FACT_REASON });

interface Case {
  need: string;
  coreSkills: string[];
  wishes: WishOutcome[];
  note?: RegExp;
}

const CASES: Case[] = [
  {
    need: "Coordinator for our home-care visits: plans the day when carers are off sick, calm with families, clear notes for the evening shift, young native Finnish speaker from a top university, 5 years experience",
    coreSkills: ["care-visit-planning", "calm-on-the-phone", "stakeholder-communication"],
    wishes: [
      kept("Plans the day when carers are off sick", "care-visit-planning"),
      kept("Calm with families", "calm-on-the-phone"),
      kept("Clear notes for the evening shift", "stakeholder-communication"),
      aside("age", PERSON_REASON),
      aside("native language", NATIVE_REASON),
      aside("school", PERSON_REASON),
      aside("5 years experience", EXPERIENCE_REASON),
    ],
  },
  {
    need: "Cook for our lunch restaurant: fast on the line, knows allergens, keeps the station clean, under 30",
    coreSkills: ["prioritisation", "food-safety", "serving-customers"],
    wishes: [
      kept("Fast on the line", "prioritisation"),
      kept("Knows allergens", "food-safety"),
      kept("Keeps the station clean", "food-safety"),
      aside("age", PERSON_REASON),
    ],
  },
  {
    need: "Customer service for our energy company: stays calm with angry callers, explains bills simply, types fast, Finnish as mother tongue",
    coreSkills: ["serving-customers", "calm-on-the-phone", "plain-language"],
    wishes: [
      kept("Stays calm with angry callers", "calm-on-the-phone"),
      kept("Explains bills simply", "plain-language"),
      aside("Types fast", "Not core for this task."),
      aside("native language", NATIVE_REASON),
    ],
  },
  {
    need: "Backend developer: API design, error handling, security, testing, Kubernetes, Kafka, 10 years, top university",
    coreSkills: ["api-design", "error-handling", "security-thinking", "testing"],
    wishes: [
      kept("API design", "api-design"),
      kept("Error handling", "error-handling"),
      kept("Security", "security-thinking"),
      kept("Testing", "testing"),
      aside("Kubernetes", EXTRA_REASON),
      aside("Kafka", EXTRA_REASON),
      aside("10 years", EXPERIENCE_REASON),
      aside("school", PERSON_REASON),
    ],
  },
  {
    need: "Someone reliable",
    coreSkills: ["prioritisation", "planning", "stakeholder-communication"],
    wishes: [aside("Reliable", "Not core for this task.")],
    note: /named no skills/,
  },
];

describe("what becomes of each wish", () => {
  for (const { need, coreSkills, wishes, note } of CASES) {
    describe(need, () => {
      const draft = draftFromNeed(need);
      const outcomes = wishOutcomes(need, draft.coreSkills.map((s) => s.id));

      it("keeps the real work wishes as 3 to 5 core skills", () => {
        expect(draft.coreSkills.map((s) => s.id)).toEqual(coreSkills);
        expect(draftProblems(draft)).toEqual([]);
      });

      it("says what happened to every wish, with an honest reason for each one set aside", () => {
        expect(outcomes).toEqual(wishes);
        if (note) expect(draft.note).toMatch(note);
      });

      it("never repeats a wish about the person in the company's own words, only its category name", () => {
        const person = outcomes.filter((w) => w.reason === PERSON_REASON || w.reason === NATIVE_REASON);
        expect(person.every((w) => PROTECTED_NAMES.includes(w.text))).toBe(true);
        const rest = outcomes.filter((w) => !person.includes(w));
        expect(protectedNames(rest.map((w) => w.text).join("\n"))).toEqual([]);
        expect(JSON.stringify(rest)).not.toMatch(/young|native|mother tongue|top university|under 30/i);
      });
    });
  }

  it("is deterministic", () => {
    const need = CASES[0].need;
    expect(wishOutcomes(need, ["care-visit-planning"])).toEqual(wishOutcomes(need, ["care-visit-planning"]));
  });

  it("sets aside a wish whose skill a model left out, without calling it an extra when the list was short", () => {
    const need = "Customer service: stays calm with angry callers, explains bills simply";
    expect(wishOutcomes(need, ["calm-on-the-phone", "serving-customers", "stakeholder-communication"])).toEqual([
      kept("Stays calm with angry callers", "calm-on-the-phone"),
      aside("Explains bills simply", "Not core for this task."),
    ]);
  });

  it("reads a working language as a fact about the job and a tool as allowed", () => {
    expect(wishOutcomes("Accountant: works in Finnish with customers, SAP", [])).toEqual([
      fact("Works in Finnish with customers"),
      aside("SAP", "A tool: the task allows any tool."),
    ]);
  });

  it("reads languages and licences as facts, and words about the people served as context", () => {
    const need =
      "We need home care nurses who can handle evening visits on their own and explain medicine changes to elderly clients and their families, with a valid Finnish nurse licence.";
    const outcomes = wishOutcomes(need, draftFromNeed(need).coreSkills.map((s) => s.id));
    expect(outcomes.some((w) => w.text === "age")).toBe(false);
    expect(outcomes).toContainEqual(fact("With a valid Finnish nurse licence"));
    expect(draftFromNeed(need).facts).toEqual(["Nurse licence needed"]);
  });

  it("keeps the people a nurse serves as part of the work, never as a wish about age", () => {
    const need = "Nurse for our ward: work language English, valid nurse licence, elderly clients, native Finnish speaker";
    const outcomes = wishOutcomes(need, draftFromNeed(need).coreSkills.map((s) => s.id));
    expect(outcomes.find((w) => w.text === "Elderly clients")?.outcome).toBe("kept");
    expect(outcomes.filter((w) => w.outcome === "fact")).toHaveLength(2);
    expect(outcomes).toContainEqual(aside("native language", NATIVE_REASON));
    expect(draftFromNeed(need).facts).toEqual(["Work language: English", "Nurse licence needed"]);
  });

  it("asks for a language level instead of a native speaker", () => {
    expect(wishOutcomes("Nurse: patient safety, native Finnish speaker", [])).toContainEqual(aside("native language", NATIVE_REASON));
  });
});
