import { describe, expect, it } from "vitest";
import { draftFromNeed } from "@/lib/ai/scripted/compose";
import type { ChallengeDraft } from "@/lib/domain/types";
import { draftProblems } from "./check-draft";

const BASE = draftFromNeed("Backend developer for our booking API: error handling, testing and code review.");

/** The base draft with one review-guide note replaced. */
function withGuide(lookFor: string): ChallengeDraft {
  return { ...BASE, reviewGuide: BASE.reviewGuide.map((g, i) => (i === 0 ? { ...g, lookFor } : g)) };
}

/** Notes that describe the work. Numbers that name the material are task facts, not a scale. */
const DESCRIBES_WORK = [
  "Notices that the handler returns HTTP 500 for a missing booking.",
  "Points to line 12, where the refund runs before the database update.",
  "Says the April total is lower than the sum of its rows.",
  "Explains why the import runs out of memory on large files.",
  "Asks how many users the outage reached before choosing a fix.",
  "Keeps the retry only if the error is transient.",
  "Compares the credit score field with the bank's own data.",
  "Moves the 30-second timeout into the config.",
];

/** Notes that would hand a reviewer points, a scale or a count of what to find. */
const SETS_A_SCORE = [
  "Give 3 points for each bug found.",
  "Finds 2 of 3 issues.",
  "Spots the two errors in the budget.",
  "Mentions at least two problems.",
  "Score the answer from 1 to 5.",
  "Rate each answer.",
  "Invite only if they find the race condition.",
  "Marks out of 10.",
  "Judged on a scale of one to five.",
  "Antaa pisteet jokaisesta löydöstä.",
];

const SCALE_PROBLEM = "The review guide must say what good work shows, without points, counts or scales";

describe("draftProblems", () => {
  it("accepts the scripted draft", () => {
    expect(draftProblems(BASE)).toEqual([]);
  });

  it.each(DESCRIBES_WORK)("accepts the review guide note %s", (lookFor) => {
    expect(draftProblems(withGuide(lookFor))).toEqual([]);
  });

  it.each(SETS_A_SCORE)("rejects the review guide note %s", (lookFor) => {
    const problems = draftProblems(withGuide(lookFor));
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join("; ")).toMatch(/review guide/);
  });

  it("names the scale problem for a guide that counts findings", () => {
    expect(draftProblems(withGuide("Spots the two errors in the budget."))).toContain(SCALE_PROBLEM);
  });

  it("accepts material with a Recommendations section", () => {
    const material = { kind: "text" as const, title: "Recommendations", body: "Recommendations: move the refund after the database write." };
    expect(draftProblems({ ...BASE, material })).toEqual([]);
  });

  it("checks the options of a choose task", () => {
    const options: ChallengeDraft["options"] = [
      { id: "a", title: "Option A", body: "Ship the trailer first." },
      { id: "b", title: "Option B", body: "The best candidate would pick this one." },
    ];
    expect(draftProblems({ ...BASE, format: "choose", options })).toEqual([expect.stringMatching(/^The option judges a person/)]);
  });
});
