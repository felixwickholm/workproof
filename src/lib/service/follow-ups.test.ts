import { beforeEach, describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { createTaster } from "./challenges";
import {
  ANSWER_CHANGED,
  FALLBACK_QUESTIONS,
  followUpProblem,
  issueFollowUps,
  MAX_FOLLOW_UP_ISSUES,
  NOT_ISSUED,
  withFallbacks,
} from "./follow-ups";
import { submitWork } from "./submissions";

const EVENT_TASK = "ch-tuulos-ml";
const ANSWER = "Split by grasp attempt, not by frame, and pick the threshold on validation data.";
const person = { id: "t_follow_ups_test_7e3c", name: "Aino Testaaja", contact: "aino.testaaja@example.org" };
const TWO = [{ answer: "Frames of one attempt look alike." }, { answer: "Where the threshold was chosen." }];

beforeEach(async () => {
  await getStore().replace(buildSeed(new Date("2026-11-14T12:00:00Z")));
});

describe("withFallbacks", () => {
  it("fills up to two plain questions for an event task and one for a practice task, never repeating one", () => {
    expect(withFallbacks("event", [])).toEqual([...FALLBACK_QUESTIONS]);
    expect(withFallbacks("event", ["Why the split?"])).toEqual(["Why the split?", FALLBACK_QUESTIONS[0]]);
    expect(withFallbacks("event", [FALLBACK_QUESTIONS[0]])).toEqual([...FALLBACK_QUESTIONS]);
    expect(withFallbacks("taster", [])).toEqual([FALLBACK_QUESTIONS[0]]);
    expect(withFallbacks("event", ["A?", "B?", "C?"])).toEqual(["A?", "B?"]);
  });
});

describe("followUpProblem", () => {
  it.each([
    ["event", TWO, undefined],
    ["event", [TWO[0]], /2 follow-up questions about your own choices \(1 answered\)/],
    ["event", [TWO[0], { answer: "  " }], /1 answered/],
    ["event", [], /0 answered/],
    ["taster", [TWO[0]], undefined],
    ["taster", [], /the follow-up question/],
  ] as const)("%s with %j", (kind, answers, problem) => {
    const found = followUpProblem(kind, [...answers]);
    if (problem) expect(found).toMatch(problem);
    else expect(found).toBeUndefined();
  });
});

describe("issued follow-up questions", () => {
  it("records the questions with an id, two for an event task and one for a practice task", async () => {
    const event = await issueFollowUps(EVENT_TASK, ANSWER);
    const taster = await createTaster("Nurse");
    const practice = await issueFollowUps(taster.id, "Call the family first.");
    expect(event.questions).toHaveLength(2);
    expect(practice.questions).toHaveLength(1);
    const issues = (await getStore().read()).followUpIssues ?? [];
    expect(issues.find((i) => i.id === event.issueId)).toMatchObject({ challengeId: EVENT_TASK, questions: event.questions });
    expect(JSON.stringify(issues)).not.toContain(ANSWER);
  });

  it("refuses a submission with invented questions, with no issue, or with another task's issue", async () => {
    const { issueId } = await issueFollowUps(EVENT_TASK, ANSWER);
    const send = (input: Partial<Parameters<typeof submitWork>[0]>) =>
      submitWork({ challengeId: EVENT_TASK, talent: person, answer: ANSWER, issueId, explain: TWO, shareWithSimilar: false, ...input });
    const invented = [
      { question: "Why did you choose this approach?", answer: "Because." },
      { question: "What would you check first?", answer: "Nothing." },
    ];
    await expect(send({ explain: invented })).rejects.toMatchObject({ status: 400, message: NOT_ISSUED });
    await expect(send({ issueId: undefined })).rejects.toMatchObject({ status: 400, message: NOT_ISSUED });
    const other = await issueFollowUps("ch-kivira-contract", ANSWER);
    await expect(send({ issueId: other.issueId })).rejects.toMatchObject({ status: 400, message: NOT_ISSUED });
    expect((await getStore().read()).submissions.some((s) => s.talentId === person.id)).toBe(false);
  });

  it("refuses an answer that changed after the questions were written", async () => {
    const { issueId } = await issueFollowUps(EVENT_TASK, ANSWER);
    await expect(
      submitWork({ challengeId: EVENT_TASK, talent: person, answer: "A different answer.", issueId, explain: TWO, shareWithSimilar: false }),
    ).rejects.toMatchObject({ status: 409, message: ANSWER_CHANGED });
  });

  it("uses an issue once, so a second person cannot reuse the same questions", async () => {
    const { issueId } = await issueFollowUps(EVENT_TASK, ANSWER);
    await submitWork({ challengeId: EVENT_TASK, talent: person, answer: ANSWER, issueId, explain: TWO, shareWithSimilar: false });
    await expect(
      submitWork({ challengeId: EVENT_TASK, talent: { ...person, id: "t_someone_else" }, answer: ANSWER, issueId, explain: TWO, shareWithSimilar: false }),
    ).rejects.toMatchObject({ status: 400, message: NOT_ISSUED });
  });

  it("keeps only the newest issues", async () => {
    await getStore().update((data) => {
      data.followUpIssues = Array.from({ length: MAX_FOLLOW_UP_ISSUES }, (_, i) => ({ id: `fu_${i}`, challengeId: EVENT_TASK, answerHash: "", questions: [], issuedAt: "" }));
    });
    const { issueId } = await issueFollowUps(EVENT_TASK, ANSWER);
    const issues = (await getStore().read()).followUpIssues ?? [];
    expect(issues).toHaveLength(MAX_FOLLOW_UP_ISSUES);
    expect(issues[0].id).toBe("fu_1");
    expect(issues.at(-1)?.id).toBe(issueId);
  });

  it("writes no questions for a task that takes no more work", async () => {
    await getStore().update((data) => {
      const sent = data.proofs.find((p) => p.challengeId === EVENT_TASK);
      const places = data.challenges.find((c) => c.id === EVENT_TASK)?.places ?? 12;
      if (!sent) throw new Error(`the seed has no proof for ${EVENT_TASK}`);
      for (let i = data.proofs.filter((p) => p.challengeId === EVENT_TASK).length; i < places; i++) data.proofs.push({ ...sent, proofId: `proof_fill_${i}` });
    });
    await expect(issueFollowUps(EVENT_TASK, ANSWER)).rejects.toMatchObject({ status: 409 });
  });
});
