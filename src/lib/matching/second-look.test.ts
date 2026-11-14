import { describe, expect, it } from "vitest";
import type { Challenge, Decision, Submission } from "@/lib/domain/types";
import { secondLookMatches } from "./second-look";

const skill = (id: string) => ({ id, label: id, why: "" });

function challenge(id: string, companyIds: string[], skills: string[]): Challenge {
  return {
    id, companyIds, title: id, need: "", coreSkills: skills.map(skill), setAside: [], format: "fix", proofKind: "code",
    minutes: 20, brief: "", deliverable: "", reviewGuide: [], aiAllowed: true, kind: "event",
    approvedBy: "Someone", createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const own = challenge("a", ["A"], ["ml-evaluation", "data-quality", "code-review"]);
const similar = challenge("b", ["B"], ["ml-evaluation", "data-quality", "experiment-design"]);
const distant = challenge("c", ["C"], ["data-quality", "sql", "testing"]);
const submission: Submission = {
  id: "p", challengeId: "a", talentId: "t", answer: "", explain: [], shareWithSimilar: true,
  submittedAt: "2026-01-01T10:00:00.000Z",
};
const pass: Decision = { id: "d", proofId: "p", companyId: "A", reviewer: "R", decision: "pass", feedback: "", decidedAt: "" };

function run(overrides: Partial<{ submission: Submission; decisions: Decision[]; now: Date }> = {}) {
  return secondLookMatches({
    submission,
    challenge: own,
    decisions: [pass],
    challenges: [own, similar, distant],
    responseWindowHours: 48,
    now: new Date("2026-01-01T12:00:00.000Z"),
    ...overrides,
  });
}

describe("secondLookMatches", () => {
  it("opens the proof to employers sharing two or more core skills after a pass", () => {
    expect(run()).toEqual([{ companyId: "B", sharedSkills: ["ml-evaluation", "data-quality"] }]);
  });

  it("needs consent", () => {
    expect(run({ submission: { ...submission, shareWithSimilar: false } })).toEqual([]);
  });

  it("waits while the owner has not decided, until the response window ends", () => {
    expect(run({ decisions: [] })).toEqual([]);
    expect(run({ decisions: [], now: new Date("2026-01-03T10:00:00.000Z") })).toHaveLength(1);
  });

  it("stays closed when the owner chose to meet", () => {
    expect(run({ decisions: [{ ...pass, decision: "meet" }] })).toEqual([]);
  });

  it("drops employers that already decided", () => {
    expect(run({ decisions: [pass, { ...pass, id: "d2", companyId: "B" }] })).toEqual([]);
  });
});
