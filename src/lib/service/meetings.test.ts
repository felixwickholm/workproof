import { beforeEach, describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { decide } from "./decisions";
import { acceptMeeting, confirmMeeting, DECLINE_ACTION, declineMeeting } from "./meetings";
import { submitWork } from "./submissions";
import { buildCityOverview } from "./views/city";
import { buildQueue } from "./views/queue";

const NOW = new Date("2026-11-14T12:00:00Z");
const person = { id: "t_meetings_test_2f7e", name: "Noor Saleh", contact: "noor.saleh@example.org" };

async function invitation() {
  const proof = await submitWork({
    challengeId: "ch-tuulos-ml",
    talent: person,
    answer: "Split by grasp attempt.",
    explain: [
      { question: "Why split by attempt?", answer: "Frames of one attempt look alike." },
      { question: "What would you check first?", answer: "Where the threshold was chosen." },
    ],
    shareWithSimilar: false,
  });
  const { meeting } = await decide({ proofId: proof.proofId, companyId: "co-tuulos", reviewer: "Elias Virta", decision: "meet", feedback: "Clear reasoning on the split. We would like to talk." });
  if (!meeting) throw new Error("A Meet decision always sends an invitation");
  return meeting;
}

beforeEach(async () => {
  await getStore().replace(buildSeed(NOW));
});

describe("declineMeeting", () => {
  it("lets only the invited person say no, and the name never reaches the company", async () => {
    const meeting = await invitation();
    const start = await getStore().read();
    const before = buildCityOverview(start).insights.funnel;
    const seededDeclines = start.audit.filter((e) => e.action === DECLINE_ACTION).length;
    await expect(declineMeeting(meeting.id, "t_guess")).rejects.toMatchObject({ status: 403 });
    await expect(declineMeeting(meeting.id, person.id)).resolves.toMatchObject({ status: "declined" });
    await expect(declineMeeting(meeting.id, person.id)).resolves.toMatchObject({ status: "declined" });

    const data = await getStore().read();
    const decided = buildQueue(data, "co-tuulos", NOW).decided.find((d) => d.meeting?.id === meeting.id);
    expect(decided?.meeting?.status).toBe("declined");
    expect(decided?.identity).toBeUndefined();
    expect(JSON.stringify(buildQueue(data, "co-tuulos", NOW))).not.toMatch(/Noor|Saleh|example\.org/);
    // The demo event already holds one declined invitation; this decline adds exactly one line.
    expect(data.audit.filter((e) => e.action === DECLINE_ACTION)).toHaveLength(seededDeclines + 1);
    expect(data.audit.at(-1)).toMatchObject({ actor: "human", by: "Talent", action: DECLINE_ACTION });

    // Still an invitation sent, never an acceptance: the city funnel does not move.
    expect(buildCityOverview(data).insights.funnel).toEqual(before);
  });

  it("cannot be accepted or confirmed after a decline", async () => {
    const meeting = await invitation();
    await declineMeeting(meeting.id, person.id);
    await expect(acceptMeeting(meeting.id, person.id)).resolves.toMatchObject({ status: "declined" });
    await expect(confirmMeeting(meeting.id, { side: "talent", talentId: person.id })).rejects.toMatchObject({ status: 409 });
    await expect(confirmMeeting(meeting.id, { side: "company", companyId: "co-tuulos" })).rejects.toMatchObject({ status: 409 });
    expect(buildQueue(await getStore().read(), "co-tuulos", NOW).decided.find((d) => d.meeting?.id === meeting.id)?.identity).toBeUndefined();
  });

  it("is only possible while the invitation is open", async () => {
    const meeting = await invitation();
    await acceptMeeting(meeting.id, person.id);
    await expect(declineMeeting(meeting.id, person.id)).rejects.toMatchObject({ status: 409 });
  });
});
