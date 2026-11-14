import { beforeEach, describe, expect, it } from "vitest";
import type { SkillScore } from "@/lib/domain/types";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { decide } from "./decisions";
import { issueFollowUps } from "./follow-ups";
import { NO_CONSENT, NO_MATCH, NOT_SCORED, recommend, recommendForCity } from "./recommendations";
import { setSharing } from "./sharing";
import { submitWork } from "./submissions";
import { shareMatches } from "./views/city-task";
import { buildPassport } from "./views/passport";
import { buildQueue } from "./views/queue";

const NOW = new Date("2026-11-14T12:00:00Z");
const TASK = "ch-tuulos-ml";
const FROM = "co-tuulos";
const person = { id: "t_recommend_test_5b2c", name: "Sara Testaaja", contact: "sara.testaaja@example.org" };

async function sendAndScore(share: boolean, scored = true): Promise<string> {
  const answer = "Split by grasp attempt, not by frame.";
  const { issueId } = await issueFollowUps(TASK, answer);
  const proof = await submitWork({ challengeId: TASK, talent: person, answer, issueId, explain: [{ answer: "One attempt stays on one side." }, { answer: "The threshold source." }], shareWithSimilar: share });
  if (scored) {
    const task = (await getStore().read()).challenges.find((c) => c.id === TASK);
    const scores = (task?.coreSkills ?? []).map((s) => ({ skillId: s.id, points: 5 as SkillScore["points"] }));
    await decide({ proofId: proof.proofId, companyId: FROM, reviewer: "Elias Virta", decision: "hold", feedback: "Clear split by attempt. We would like to hear more.", scores });
  }
  return proof.proofId;
}

beforeEach(async () => {
  await getStore().replace(buildSeed(NOW));
});

describe("share good candidates", () => {
  it("shares scored work with a company hiring for the same skills, which sees who shared it but never the scores", async () => {
    const proofId = await sendAndScore(true);
    const data = await getStore().read();
    const to = shareMatches(data, TASK)[0];
    expect(to).toBeDefined();
    await recommend({ proofId, fromCompanyId: FROM, toCompanyId: to.companyId });
    const after = await getStore().read();
    const queue = buildQueue(after, to.companyId, NOW);
    const shown = queue.recommended.find((p) => p.proofId === proofId);
    expect(shown?.recommendedBy).toBe(after.companies.find((c) => c.id === FROM)?.name);
    expect(JSON.stringify(shown)).not.toMatch(/"scores"|"total"|Sara|Testaaja/);
    expect(buildPassport(after, person.id, NOW)[0].recommendedTo).toEqual([{ to: to.name, by: after.companies.find((c) => c.id === FROM)?.name }]);
    await expect(recommend({ proofId, fromCompanyId: FROM, toCompanyId: to.companyId })).rejects.toMatchObject({ status: 409 });
  });

  it("needs the person's consent, the sender's scores and a matching challenge", async () => {
    const closed = await sendAndScore(false);
    const to = shareMatches(await getStore().read(), TASK)[0].companyId;
    await expect(recommend({ proofId: closed, fromCompanyId: FROM, toCompanyId: to })).rejects.toMatchObject({ status: 403, message: NO_CONSENT });
    await getStore().replace(buildSeed(NOW));
    const unscored = await sendAndScore(true, false);
    await expect(recommend({ proofId: unscored, fromCompanyId: FROM, toCompanyId: to })).rejects.toMatchObject({ status: 409, message: NOT_SCORED });
    const data = await getStore().read();
    const unmatched = data.companies.find((c) => c.id !== FROM && !shareMatches(data, TASK).some((m) => m.companyId === c.id));
    await getStore().replace(buildSeed(NOW));
    const scored = await sendAndScore(true);
    if (unmatched) await expect(recommend({ proofId: scored, fromCompanyId: FROM, toCompanyId: unmatched.id })).rejects.toMatchObject({ message: NO_MATCH });
  });

  it("lets the city share it in its own name, and taking consent back removes unanswered shares", async () => {
    const proofId = await sendAndScore(true);
    const to = shareMatches(await getStore().read(), TASK)[0];
    await expect(recommendForCity({ proofId, toCompanyId: to.companyId, by: " " })).rejects.toMatchObject({ status: 400 });
    const shared = await recommendForCity({ proofId, toCompanyId: to.companyId, by: "Maija Kaupunki" });
    expect(shared).toMatchObject({ fromCompanyId: FROM, byCity: "Maija Kaupunki" });
    const queue = buildQueue(await getStore().read(), to.companyId, NOW);
    expect(queue.recommended.find((p) => p.proofId === proofId)?.recommendedBy).toMatch(/^the City of Espoo \(from .+'s challenge\)$/);
    // The demo event already holds other people's shares; only this person's share goes.
    const seeded = (await getStore().read()).recommendations?.filter((r) => r.proofId !== proofId);
    await setSharing(proofId, person.id, false);
    expect((await getStore().read()).recommendations).toEqual(seeded);
    expect(buildQueue(await getStore().read(), to.companyId, NOW).recommended.some((p) => p.proofId === proofId)).toBe(false);
  });
});
