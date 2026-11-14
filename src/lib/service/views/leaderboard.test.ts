import { beforeEach, describe, expect, it } from "vitest";
import type { SkillScore } from "@/lib/domain/types";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { decide, decideHold } from "../decisions";
import { issueFollowUps } from "../follow-ups";
import { acceptMeeting, confirmMeeting, recordFollowUp, recordHire } from "../meetings";
import { submitWork } from "../submissions";
import { buildCityOverview } from "./city";
import { buildCityTask } from "./city-task";
import { buildEmployerHome } from "./employer";
import { buildCompanyTasks, buildTopProofs } from "./leaderboard";
import { buildPassport } from "./passport";

const NOW = new Date("2026-11-14T12:00:00Z");
/** A task no seeded reviewer has scored yet, so every score and step below is this test's own. */
const TASK = "ch-harjula-opening";
const COMPANY = "co-harjula";
const REVIEWER = "Pekka Harjula";
const FEEDBACK = "You propped the slab first and said why. Tell us how you would check the lintel.";

async function send(n: number): Promise<{ proofId: string; talentId: string }> {
  const answer = `Prop the slab on both sides before the cut, then check the lintel load. Version ${n}.`;
  const talentId = `t_leaderboard_${n}`;
  const { issueId } = await issueFollowUps(TASK, answer);
  const proof = await submitWork({
    challengeId: TASK,
    talent: { id: talentId, name: `Person ${n} Testaaja`, contact: `person${n}@example.org` },
    answer,
    issueId,
    explain: [{ answer: "The slab above carries two floors." }, { answer: "The site team needs the prop spacing first." }],
    shareWithSimilar: true,
  });
  return { proofId: proof.proofId, talentId };
}

async function points(each: number[]): Promise<SkillScore[]> {
  const task = (await getStore().read()).challenges.find((c) => c.id === TASK);
  return (task?.coreSkills ?? []).map((s, i) => ({ skillId: s.id, points: (each[i] ?? each[0]) as SkillScore["points"] }));
}

const score = async (proofId: string, decision: "meet" | "pass" | "hold", each: number[]) =>
  decide({ proofId, companyId: COMPANY, reviewer: REVIEWER, decision, feedback: FEEDBACK, scores: await points(each) });

beforeEach(async () => {
  await getStore().replace(buildSeed(NOW));
});

describe("human scores", () => {
  it("refuses a decision without one score per core skill from the named reviewer", async () => {
    const { proofId } = await send(1);
    await expect(decide({ proofId, companyId: COMPANY, reviewer: REVIEWER, decision: "meet", feedback: FEEDBACK, scores: [] })).rejects.toMatchObject({ status: 400 });
    await expect(decide({ proofId, companyId: COMPANY, reviewer: "Somebody Else", decision: "hold", feedback: FEEDBACK, scores: await points([3]) })).rejects.toMatchObject({ status: 403 });
    expect((await getStore().read()).decisions.some((d) => d.proofId === proofId)).toBe(false);
  });

  it("stores the points and the total, and a hold creates no meeting until it becomes meet", async () => {
    const { proofId } = await send(1);
    const { decision, meeting } = await score(proofId, "hold", [4, 5, 4, 5]);
    expect(decision).toMatchObject({ decision: "hold", total: 9 });
    expect(meeting).toBeUndefined();
    await expect(decideHold(decision.id, { decision: "meet", reviewer: "AI bot" })).rejects.toMatchObject({ status: 403 });
    const decided = await decideHold(decision.id, { decision: "meet", reviewer: REVIEWER });
    expect(decided.decision).toMatchObject({ decision: "meet", total: 9, feedback: FEEDBACK });
    expect(decided.meeting?.status).toBe("invited");
    await expect(decideHold(decision.id, { decision: "pass", reviewer: REVIEWER })).rejects.toMatchObject({ status: 409 });
  });
});

describe("the leaderboard for one task", () => {
  it("lists scored proofs highest total first, ties by arrival, then unscored ones oldest first", async () => {
    const a = await send(1);
    const b = await send(2);
    const c = await send(3);
    await send(4);
    await score(a.proofId, "hold", [3]);
    await score(b.proofId, "meet", [5]);
    await score(c.proofId, "pass", [3]);
    const top = buildTopProofs(await getStore().read(), COMPANY, TASK);
    expect(top.scored.map((t) => [t.proof.proofId, t.total])).toEqual([[b.proofId, 10], [a.proofId, 6], [c.proofId, 6]]);
    expect(top.waiting.every((p, i, all) => i === 0 || all[i - 1].submittedAt <= p.submittedAt)).toBe(true);
    expect(top.scored.length + top.waiting.length).toBe((await getStore().read()).proofs.filter((p) => p.challengeId === TASK).length);
    expect(top.counts).toMatchObject({ scored: 3, invited: 1, agreed: 0 });
  });

  it("shows a name only after the person accepted this company's meeting", async () => {
    const a = await send(1);
    const { meeting } = await score(a.proofId, "meet", [4]);
    const before = buildTopProofs(await getStore().read(), COMPANY, TASK);
    expect(JSON.stringify(before)).not.toContain("Person 1 Testaaja");
    await acceptMeeting(meeting?.id ?? "", a.talentId);
    const after = buildTopProofs(await getStore().read(), COMPANY, TASK);
    expect(after.scored[0].identity).toEqual({ name: "Person 1 Testaaja", contact: "person1@example.org" });
    expect(JSON.stringify(after)).not.toContain(a.talentId);
  });

  it("gives the company its tasks with counts and top total, and its home the same per task", async () => {
    const a = await send(1);
    await score(a.proofId, "hold", [4]);
    const data = await getStore().read();
    const summary = buildCompanyTasks(data, COMPANY).find((t) => t.challenge.id === TASK);
    expect(summary).toMatchObject({ counts: { scored: 1 }, topTotal: 8 });
    expect(buildEmployerHome(data, COMPANY, NOW).tasks.find((t) => t.challenge.id === TASK)).toMatchObject({ scored: 1, topTotal: 8 });
  });
});

describe("impact after the talk", () => {
  it("counts proofs at every step, follow-ups and hires included, and the city sees no name", async () => {
    const a = await send(1);
    const { meeting } = await score(a.proofId, "meet", [5]);
    const id = meeting?.id ?? "";
    await expect(recordFollowUp(id, COMPANY, true)).rejects.toMatchObject({ status: 409 });
    await acceptMeeting(id, a.talentId);
    await confirmMeeting(id, { side: "talent", talentId: a.talentId });
    await confirmMeeting(id, { side: "company", companyId: COMPANY });
    await expect(recordHire(id, "co-hohka")).rejects.toMatchObject({ status: 403 });
    await recordFollowUp(id, COMPANY, true);
    await recordHire(id, COMPANY);
    const data = await getStore().read();
    const task = buildCityOverview(data).insights.impact.tasks.find((t) => t.challengeId === TASK);
    expect(task).toMatchObject({ scored: 1, invited: 1, agreed: 1, met: 1, followUps: 1, hires: 1, topTotal: 10 });
    const city = buildCityTask(data, TASK);
    expect(city.top[0]).toMatchObject({ proofId: a.proofId, total: 10, canShare: true, sharedWith: [] });
    const text = JSON.stringify([city, buildCityOverview(data)]);
    for (const secret of [a.talentId, "Person 1 Testaaja", "person1@example.org"]) expect(text).not.toContain(secret);
  });

  it("sorts the city's tasks by people who took them", () => {
    const tasks = buildCityOverview(buildSeed(NOW)).insights.impact.tasks;
    expect(tasks.every((t, i) => i === 0 || tasks[i - 1].took >= t.took)).toBe(true);
  });

  it("shows the person how a named reviewer scored the work", async () => {
    const a = await send(1);
    await score(a.proofId, "pass", [2, 3, 4, 3]);
    const entry = buildPassport(await getStore().read(), a.talentId, NOW)[0];
    expect(entry.responses[0]).toMatchObject({ reviewer: REVIEWER, total: 6, feedback: FEEDBACK });
    expect(entry.responses[0].scores?.map((s) => s.points)).toEqual([2, 3, 4, 3]);
    expect(entry.responses[0].scores?.every((s) => s.label.length > 0)).toBe(true);
  });
});
