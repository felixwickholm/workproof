import type { SkillScore } from "@/lib/domain/types";
import { beforeEach, describe, expect, it } from "vitest";
import type { Company } from "@/lib/domain/types";
import { NAMED_PERSON_NEEDED } from "@/lib/domain/guardrails";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { decide } from "./decisions";
import { MAX_REVIEWERS } from "./capacity";
import { addReviewer, companyReviewers, isRegisteredReviewer } from "./reviewers";
import { ServiceError } from "./support";

/** The reviewer's own points for every core skill of the proof's task: a person gives these, never software. */
async function threeEach(proofId: string): Promise<SkillScore[]> {
  const data = await getStore().read();
  const challengeId = data.submissions.find((s) => s.id === proofId)?.challengeId;
  return (data.challenges.find((c) => c.id === challengeId)?.coreSkills ?? []).map((s) => ({ skillId: s.id, points: 3 }));
}

const FEEDBACK = "Clear order of work on the opening. We would like to talk about it.";

async function waitingProof(companyId: string): Promise<string> {
  const data = await getStore().read();
  const own = new Set(data.challenges.filter((c) => c.kind === "event" && c.companyIds.includes(companyId)).map((c) => c.id));
  const decided = new Set(data.decisions.map((d) => d.proofId));
  const proof = data.proofs.find((p) => own.has(p.challengeId) && !decided.has(p.proofId));
  if (!proof) throw new Error(`no waiting proof for ${companyId}`);
  return proof.proofId;
}

async function status(run: () => Promise<unknown>): Promise<{ status: number; message: string }> {
  try {
    await run();
    return { status: 200, message: "" };
  } catch (error) {
    if (error instanceof ServiceError) return { status: error.status, message: error.message };
    throw error;
  }
}

describe("registered reviewers", () => {
  beforeEach(async () => {
    await getStore().replace(buildSeed(new Date()));
  });

  it("reads the company's own list, matching names without regard to spaces or case", async () => {
    const harjula = (await getStore().read()).companies.find((c) => c.id === "co-harjula");
    expect(harjula && companyReviewers(harjula)).toEqual(["Pekka Harjula"]);
    expect(harjula && isRegisteredReviewer(harjula, "  pekka   HARJULA ")).toBe(true);
    expect(companyReviewers({ id: "co-none", name: "Nobody" } as Company)).toEqual([]);
  });

  it("registers a reviewer for every seeded company", async () => {
    const { companies } = await getStore().read();
    expect(companies.every((c) => (c.reviewers ?? []).length > 0)).toBe(true);
  });

  it("refuses a decision from a name the company has not registered, even a person's", async () => {
    const proofId = await waitingProof("co-harjula");
    const scores = await threeEach(proofId);
    const bot = await status(() => decide({ proofId, companyId: "co-harjula", reviewer: "AI bot", decision: "pass", feedback: FEEDBACK, scores }));
    const stranger = await status(() => decide({ proofId, companyId: "co-harjula", reviewer: "Eeva Example", decision: "pass", feedback: FEEDBACK, scores }));
    expect(bot).toEqual({ status: 400, message: NAMED_PERSON_NEEDED });
    expect(stranger.status).toBe(403);
    expect(stranger.message).toContain("add yourself as a reviewer first");
    expect((await getStore().read()).decisions.some((d) => d.proofId === proofId)).toBe(false);
  });

  it("lets a person decide after the explicit step, and logs the step", async () => {
    const proofId = await waitingProof("co-harjula");
    const scores = await threeEach(proofId);
    expect(await addReviewer("co-harjula", "  Eeva   Example ")).toEqual({ companyId: "co-harjula", reviewers: ["Pekka Harjula", "Eeva Example"] });
    await addReviewer("co-harjula", "eeva example");
    const { decision } = await decide({ proofId, companyId: "co-harjula", reviewer: "Eeva Example", decision: "pass", feedback: FEEDBACK, scores });
    const data = await getStore().read();
    expect(decision.reviewer).toBe("Eeva Example");
    expect(data.companies.find((c) => c.id === "co-harjula")?.reviewers).toEqual(["Pekka Harjula", "Eeva Example"]);
    expect(data.audit.filter((e) => e.action === "Added a reviewer")).toHaveLength(1);
  });

  it.each(["AI bot", "auto", "System", "x", "", "GPT model", "a".repeat(81)])("refuses to register %j", async (name) => {
    expect(await status(() => addReviewer("co-harjula", name))).toEqual({ status: 400, message: NAMED_PERSON_NEEDED });
  });

  it("keeps at most the demo's number of reviewers per company, and still accepts a name already listed", async () => {
    for (let i = 1; i < MAX_REVIEWERS; i++) await addReviewer("co-harjula", `Eeva ${String.fromCharCode(65 + i)}lander`);
    expect((await addReviewer("co-harjula", "pekka harjula")).reviewers).toHaveLength(MAX_REVIEWERS);
    expect(await status(() => addReviewer("co-harjula", "Mira Example"))).toEqual({ status: 429, message: `Harjula Engineering has ${MAX_REVIEWERS} reviewers, the most this demo keeps.` });
  });

  it("answers 404 for an unknown company", async () => {
    expect((await status(() => addReviewer("co-none", "Eeva Example"))).status).toBe(404);
  });
});
