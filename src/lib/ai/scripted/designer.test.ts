import { describe, expect, it } from "vitest";
import type { Challenge } from "@/lib/domain/types";
import { draftFromNeed, tasterFor } from "./compose";
import { followUpQuestions } from "./follow-ups";
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

  it("describes which planted issues the work names", () => {
    const challenge = asChallenge("Backend developer for a payments API");
    const summary = describeWork(challenge, "There is no timeout on the fetch. Add one of five seconds.", []);
    expect(summary).toContain("the outbound call without a timeout");
    expect(summary).toContain("Does not mention tests");
  });
});
