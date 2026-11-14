import { beforeEach, describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { countAiWork, FOLLOW_UP_ACTION } from "./ai-work";
import { issueFollowUps } from "./follow-ups";
import { resetDemo } from "./demo";

describe("AI work counted from the audit log", () => {
  beforeEach(async () => {
    await resetDemo();
  });

  it("counts the follow-up questions the seed event asked", () => {
    const data = buildSeed(new Date("2026-11-14T12:00:00.000Z"));
    const asked = data.submissions.reduce((sum, s) => sum + s.explain.length, 0);
    expect(asked).toBeGreaterThan(0);
    expect(countAiWork(data.audit).questions).toBe(asked);
  });

  it("logs one audit event when follow-up questions are generated", async () => {
    const before = (await getStore().read()).audit.filter((e) => e.action === FOLLOW_UP_ACTION).length;
    const { questions } = await issueFollowUps("ch-tuulos-ml", "I would split the data by grasp attempt.");
    const audit = (await getStore().read()).audit;
    const events = audit.filter((e) => e.action === FOLLOW_UP_ACTION);
    expect(events).toHaveLength(before + 1);
    expect(events.at(-1)?.actor).toBe("ai");
    expect(countAiWork(audit).questions).toBe(countAiWork(buildSeed(new Date()).audit).questions + questions.length);
  });
});
