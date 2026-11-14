import { describe, expect, it } from "vitest";
import type { Challenge } from "@/lib/domain/types";
import { draftProblems } from "@/lib/guard/check-draft";
import { protectedNames } from "@/lib/guard/protected";
import { draftFromNeed, tasterFor } from "./compose";
import { followUpQuestions } from "./follow-ups";
import { countsFindings } from "@/lib/guard/no-judgement";
import { describeWork } from "./summarise";

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

  it("names the topics the work talks about, never a count of what it found", () => {
    const challenge = asChallenge("Backend developer for a payments API");
    const summary = describeWork(challenge, "There is no timeout on the fetch. Add a timeout of five seconds.", []);
    expect(summary).toBe("Discusses timeouts. Proposes a change to timeouts. Does not mention tests and rollout.");
  });

  it("gives a keyword list the same kind of summary as a careful answer, without counting", () => {
    const challenge = asChallenge("ML engineer for grasp detection: model evaluation, data quality, code review");
    const keywords = describeWork(challenge, "split leak, threshold on validation, report recall.", []);
    const careful = describeWork(
      challenge,
      "Split by grasp attempt, because frames of one attempt leak into test. Pick the threshold on a validation split. Report recall on dropped grasps.",
      [],
    );
    for (const summary of [keywords, careful]) {
      expect(summary).toMatch(/^Discusses /);
      expect(countsFindings(summary)).toBe(false);
      expect(summary).not.toMatch(/\b(?:one|two|three|issues?|flaws?)\b/i);
    }
  });

  it("builds a draft for an unknown role without any word from the need", () => {
    const draft = draftFromNeed("We need a young female beekeeper for our rooftop");
    const shown = [draft.title, draft.need, draft.brief, draft.material?.body ?? "", draft.deliverable].join("\n");
    expect(shown).not.toMatch(/young|female|beekeeper|rooftop/i);
    expect(draft.need).toBe("A role: Prioritisation, Planning, Stakeholder communication");
    expect(draftProblems(draft)).toEqual([]);
  });

  it("shows the need as the company wrote it when nothing in it is protected", () => {
    expect(draftFromNeed("Backend developer for our payments API: API design, error handling, security, testing").need).toBe(
      "Backend developer for our payments API: API design, error handling, security, testing",
    );
  });

  it("keeps a working language as a neutral line, never a native-speaker wish", () => {
    const working = draftFromNeed("Accountant for monthly closing who works in Finnish with customers");
    expect(working.setAside).toContain("Working language: Finnish: talk about it in the meeting");
    const native = draftFromNeed("Accountant for monthly closing, native Finnish speaker");
    expect(protectedNames(native.need)).toEqual([]);
    expect(native.setAside.join(" ")).toContain("Not used: native language");
  });
});
