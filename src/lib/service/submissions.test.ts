import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PLACES, placesOf } from "@/lib/domain/places";
import type { ExplainAnswer } from "@/lib/domain/types";
import { CLEAN, dataUrl } from "@/lib/http/jpeg-test-data";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { createTaster } from "./challenges";
import { followUpProblem, submitWork } from "./submissions";
import { findOrThrow } from "./support";

const EVENT_TASK = "ch-tuulos-ml";
const TWO: ExplainAnswer[] = [
  { question: "Why split by attempt?", answer: "Frames of one attempt look alike, so they must stay on one side." },
  { question: "What would you check first?", answer: "Whether the threshold was chosen on the test set." },
];
const person = { id: "t_submissions_test_4c2a", name: "Wilhelmiina Testaaja", contact: "wilhelmiina.testaaja@example.org" };

beforeEach(async () => {
  await getStore().replace(buildSeed(new Date("2026-11-14T12:00:00Z")));
});

describe("followUpProblem", () => {
  const blank = { question: "Why?", answer: "  " };
  it.each([
    ["event", TWO, undefined],
    ["event", [TWO[0]], /2 follow-up questions about your own choices \(1 answered\)/],
    ["event", [TWO[0], blank], /1 answered/],
    ["event", [], /0 answered/],
    ["taster", [TWO[0]], undefined],
    ["taster", [], /the follow-up question/],
    ["taster", [{ question: " ", answer: "An answer with no question." }], /the follow-up question/],
  ] as const)("%s with %j", (kind, explain, problem) => {
    const found = followUpProblem(kind, [...explain]);
    if (problem) expect(found).toMatch(problem);
    else expect(found).toBeUndefined();
  });
});

describe("submitWork", () => {
  const send = (input: Partial<Parameters<typeof submitWork>[0]> = {}) =>
    submitWork({ challengeId: EVENT_TASK, talent: person, answer: "Split by grasp attempt.", explain: TWO, shareWithSimilar: false, ...input });

  it("refuses an event proof without two answered follow-ups, with a clear 400", async () => {
    await expect(send({ explain: [TWO[0]] })).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/2 follow-up questions/) });
    await expect(send({ explain: [] })).rejects.toMatchObject({ status: 400 });
    await expect(send()).resolves.toMatchObject({ explain: [{ question: TWO[0].question }, { question: TWO[1].question }] });
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
    await expect(
      submitWork({ challengeId: taster.id, talent: person, answer: "I would call the family first.", explain: [], shareWithSimilar: false }),
    ).rejects.toMatchObject({ status: 400, message: expect.stringMatching(/follow-up question/) });
    const proof = await submitWork({
      challengeId: taster.id,
      talent: { ...person, contact: "" },
      answer: "I am Wilhelmiina. I would call the family first, then the doctor.",
      explain: [{ question: "Why the family first?", answer: "Wilhelmiina here: they know the medicines." }],
      shareWithSimilar: false,
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
    for (let i = taken; i < places; i++) await send();
    const before = (await getStore().read()).proofs.length;
    await expect(send()).rejects.toMatchObject({ status: 409, message: `This task has all its ${places} answers. Choose another task.` });
    expect((await getStore().read()).proofs.length).toBe(before);
  });

  it("has no limit on a practice task", { timeout: 30_000 }, async () => {
    const taster = await createTaster("Nurse");
    const practice = () =>
      submitWork({ challengeId: taster.id, talent: { ...person, contact: "" }, answer: "I would call the family first.", explain: [TWO[0]], shareWithSimilar: false });
    for (let i = 0; i <= DEFAULT_PLACES; i++) await practice();
    expect((await getStore().read()).proofs.filter((p) => p.challengeId === taster.id)).toHaveLength(DEFAULT_PLACES + 1);
  });

  it("stores identity for an event proof", async () => {
    await send();
    expect((await getStore().read()).talents.find((t) => t.id === person.id)).toMatchObject({ name: person.name, locked: true });
  });
});
