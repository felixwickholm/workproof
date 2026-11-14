import { describe, expect, it } from "vitest";
import type { Challenge } from "@/lib/domain/types";
import { draftProblems } from "@/lib/guard/check-draft";
import { protectedNames } from "@/lib/guard/protected";
import { draftFromNeed, tasterFor } from "./compose";
import { followUpQuestions } from "./follow-ups";

function asChallenge(need: string): Challenge {
  return { ...draftFromNeed(need), id: "c1", companyIds: ["A"], createdAt: "2026-01-01T00:00:00.000Z" };
}

describe("scripted designer", () => {
  it("keeps 3 to 5 skills and sets the rest aside", () => {
    const draft = draftFromNeed(
      "Backend developer: API design, error handling, security, testing, SQL, performance, Kubernetes, 8 years of Java, fluent Finnish, culture fit",
    );
    expect(draft.coreSkills).toHaveLength(4);
    expect(draft.setAside.join(" ")).toContain("Not used: culture fit");
    expect(draft.reviewGuide.map((g) => g.skillId)).toEqual(draft.coreSkills.map((s) => s.id));
  });

  it("completes short needs from the role template", () => {
    expect(draftFromNeed("Data engineer").coreSkills.length).toBeGreaterThanOrEqual(3);
  });

  it("is deterministic", () => {
    const need = "ML engineer, model evaluation";
    expect(draftFromNeed(need)).toEqual(draftFromNeed(need));
  });

  it("drafts a 2-minute taster", () => {
    const taster = tasterFor("I want to be a nurse");
    expect(taster.minutes).toBe(2);
    expect(taster.kind).toBe("taster");
  });

  it("asks two follow-ups that quote the answer", () => {
    const challenge = asChallenge("Backend developer for a payments API");
    const answer = "The fetch call has no timeout, so slow periods pile up requests. I would add an AbortSignal timeout and cap retries at three.";
    const questions = followUpQuestions(challenge, answer);
    expect(questions).toHaveLength(2);
    expect(questions[0]).toContain('"');
    expect(questions[1]).toMatch(/^If .+, what would you change in your answer\?$/);
    expect(followUpQuestions(challenge, answer)).toEqual(questions);
  });

  it("asks for reasoning when the answer is very short", () => {
    expect(followUpQuestions(asChallenge("Backend developer"), "Add a timeout.")[0]).toContain("reasoning");
  });

  it("builds a draft for an unknown role without any word from the need", () => {
    const draft = draftFromNeed("We need a young female beekeeper for our rooftop");
    const shown = [draft.title, draft.need, draft.brief, draft.material?.body ?? "", draft.deliverable].join("\n");
    expect(shown).not.toMatch(/young|female|beekeeper|rooftop/i);
    expect(draft.need).toBe("Core skills: Prioritisation, Planning, Stakeholder communication");
    expect(draft.note).toMatch(/No close match/);
    expect(draftProblems(draft)).toEqual([]);
  });

  it("never shows the company's own sentence to talent, only the role and the core skills", () => {
    const draft = draftFromNeed("Backend developer for our payments API: API design, error handling, security, testing");
    expect(draft.need).toBe(`Backend engineer: ${draft.coreSkills.map((s) => s.label).join(", ")}`);
    expect(draft.note).toBeUndefined();
  });

  it("picks the closest library role by the skills a need describes", () => {
    const draft = draftFromNeed("We need someone who understands heating prices and billing data");
    expect(draft.note).toBeUndefined();
    expect(draft.need).toMatch(/^Data analyst: /);
  });

  it("gives an unknown dream job a neutral taster that does not repeat the job name", () => {
    const taster = tasterFor("I want to be a beekeeper on rooftops");
    expect(JSON.stringify(taster)).not.toMatch(/beekeeper|rooftop/i);
    expect(taster.title).toBe("Spot the problem in a plan");
  });

  it("keeps a working language as a neutral line, never a native-speaker wish", () => {
    const working = draftFromNeed("Accountant for monthly closing who works in Finnish with customers");
    expect(working.setAside).toContain("Working language: Finnish: talk about it in the meeting");
    const native = draftFromNeed("Accountant for monthly closing, native Finnish speaker");
    expect(protectedNames(native.need)).toEqual([]);
    expect(native.setAside.join(" ")).toContain("Not used: native language");
  });
});
