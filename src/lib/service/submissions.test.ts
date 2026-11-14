import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PLACES, placesOf } from "@/lib/domain/places";
import { CLEAN, dataUrl } from "@/lib/http/jpeg-test-data";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { createTaster } from "./challenges";
import { issueFollowUps, type SentFollowUp } from "./follow-ups";
import { ALREADY_ANSWERED, CHOICE_NEEDED, submitWork } from "./submissions";
import { findOrThrow } from "./support";

const EVENT_TASK = "ch-tuulos-ml";
const TWO: SentFollowUp[] = [
  { answer: "Frames of one attempt look alike, so they must stay on one side." },
  { answer: "Whether the threshold was chosen on the test set." },
];
const ANSWER = "Split by grasp attempt.";
const person = { id: "t_submissions_test_4c2a", name: "Wilhelmiina Testaaja", contact: "wilhelmiina.testaaja@example.org" };

beforeEach(async () => {
  await getStore().replace(buildSeed(new Date("2026-11-14T12:00:00Z")));
});

describe("submitWork", () => {
  type Input = Parameters<typeof submitWork>[0];
  /** Asks the server for the questions first, the way the work flow does, then sends. */
  const send = async (input: Partial<Input> = {}) => {
    const challengeId = input.challengeId ?? EVENT_TASK;
    const answer = input.answer ?? ANSWER;
    const { issueId } = await issueFollowUps(challengeId, answer);
    return submitWork({ challengeId, talent: person, answer, issueId, explain: TWO, shareWithSimilar: false, ...input });
  };

  it("refuses an event proof without two answered follow-ups, with a clear 400", async () => {
    await expect(send({ explain: [TWO[0]] })).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/2 follow-up questions about your own choices \(1 answered\)/) });
    await expect(send({ explain: [TWO[0], { answer: "  " }] })).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/1 answered/) });
    await expect(send({ explain: [] })).rejects.toMatchObject({ status: 400 });
    const proof = await send();
    expect(proof.explain.map((e) => e.answer)).toEqual(TWO.map((e) => e.answer));
  });

  it("stores the questions in the server's own words, never the request's", async () => {
    const { issueId, questions } = await issueFollowUps(EVENT_TASK, ANSWER);
    await submitWork({ challengeId: EVENT_TASK, talent: person, answer: ANSWER, issueId, explain: TWO, shareWithSimilar: false });
    const stored = (await getStore().read()).submissions.find((s) => s.talentId === person.id);
    expect(stored?.explain.map((e) => e.question)).toEqual(questions);
  });

  it("refuses a picture the person did not confirm, and stores the confirmation with an accepted one", async () => {
    const picture = { kind: "photo" as const, src: dataUrl(CLEAN), alt: "Two piles of frames on a desk" };
    await expect(send({ attachment: picture })).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/no face, no name, no badge/) });
    const proof = await send({ attachment: { ...picture, confirmed: true } });
    const stored = (await getStore().read()).submissions.find((s) => s.id === proof.proofId);
    expect(stored?.attachment).toEqual({ ...picture, confirmed: true });
    expect(proof.attachment).toEqual(picture);
  });

  it("keeps no identity for a practice task: the name hides itself and is stored nowhere", async () => {
    const taster = await createTaster("Nurse");
    await expect(send({ challengeId: taster.id, explain: [] })).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/follow-up question/) });
    const proof = await send({
      challengeId: taster.id,
      talent: { ...person, contact: "" },
      answer: "I am Wilhelmiina. I would call the family first, then the doctor.",
      explain: [{ answer: "Wilhelmiina here: they know the medicines." }],
    });
    const data = await getStore().read();
    expect(proof.hiddenCount).toBeGreaterThan(0);
    expect(data.talents.some((t) => t.id === person.id)).toBe(false);
    expect(JSON.stringify(data)).not.toMatch(/Wilhelmiina|Testaaja/);
  });

  it("takes no new work once an event task has all its answers, and says so plainly", { timeout: 60_000 }, async () => {
    const data = await getStore().read();
    const places = placesOf(findOrThrow(data.challenges, (c) => c.id === EVENT_TASK, "Challenge")) ?? 0;
    const taken = data.proofs.filter((p) => p.challengeId === EVENT_TASK).length;
    for (let i = taken; i < places; i++) await send({ talent: { ...person, id: `${person.id}_${i}` } });
    const before = (await getStore().read()).proofs.length;
    await expect(send()).rejects.toMatchObject({ status: 409, message: `This task has all its ${places} answers. Choose another task.` });
    expect((await getStore().read()).proofs.length).toBe(before);
  });

  it("takes one proof per person per event task, and says where the first one is", async () => {
    await send();
    await expect(send({ answer: "A second, different answer to the same task." })).rejects.toMatchObject({ status: 409, message: ALREADY_ANSWERED });
    expect((await getStore().read()).submissions.filter((s) => s.talentId === person.id)).toHaveLength(1);
  });

  it("takes one place for a double tap: two sends at once with the same questions make one proof", async () => {
    const { issueId } = await issueFollowUps(EVENT_TASK, ANSWER);
    const once = () => submitWork({ challengeId: EVENT_TASK, talent: person, answer: ANSWER, issueId, explain: TWO, shareWithSimilar: false });
    const results = await Promise.allSettled([once(), once()]);
    expect(results.map((r) => r.status).sort()).toEqual(["fulfilled", "rejected"]);
    expect(results.find((r) => r.status === "rejected")).toMatchObject({ reason: { status: 409, message: ALREADY_ANSWERED } });
    expect((await getStore().read()).submissions.filter((s) => s.talentId === person.id)).toHaveLength(1);
  });

  it("has no limit on a practice task, for the same person too", { timeout: 30_000 }, async () => {
    const taster = await createTaster("Nurse");
    const practice = () => send({ challengeId: taster.id, talent: { ...person, contact: "" }, answer: "I would call the family first.", explain: [TWO[0]] });
    for (let i = 0; i <= DEFAULT_PLACES; i++) await practice();
    expect((await getStore().read()).proofs.filter((p) => p.challengeId === taster.id)).toHaveLength(DEFAULT_PLACES + 1);
  });

  it("stores identity for an event proof", async () => {
    await send();
    expect((await getStore().read()).talents.find((t) => t.id === person.id)).toMatchObject({ name: person.name, locked: true });
  });

  it("keeps a choice only on a choose task, where it is required, and hides identity in the spoken thinking", async () => {
    await getStore().update((data) => {
      const task = data.challenges.find((c) => c.id === EVENT_TASK);
      if (task) task.format = "choose";
    });
    await expect(send()).rejects.toMatchObject({ status: 400, message: CHOICE_NEEDED });
    const proof = await send({ choice: "b", thinkAloud: { transcript: "I am Wilhelmiina from Lahti. I pick b because the split keeps attempts apart.", seconds: 42 } });
    expect(proof.choice).toBe("b");
    expect(proof.thinkAloud?.seconds).toBe(42);
    expect(proof.thinkAloud?.transcript).not.toMatch(/Wilhelmiina|Lahti/);
    expect(proof.thinkAloud?.transcript).toContain("the split keeps attempts apart");
  });
});
