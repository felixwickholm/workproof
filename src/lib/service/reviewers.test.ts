import { beforeEach, describe, expect, it } from "vitest";
import type { Company } from "@/lib/domain/types";
import { NAMED_PERSON_NEEDED } from "@/lib/domain/guardrails";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { decide } from "./decisions";
import { addReviewer, companyReviewers, isRegisteredReviewer } from "./reviewers";
import { ServiceError } from "./support";

const FEEDBACK = "Clear reasoning on the split. We would like to talk about it.";

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
    const kaari = (await getStore().read()).companies.find((c) => c.id === "co-kaari");
    expect(kaari && companyReviewers(kaari)).toEqual(["Anna Koivisto"]);
    expect(kaari && isRegisteredReviewer(kaari, "  anna   KOIVISTO ")).toBe(true);
    expect(companyReviewers({ id: "co-none", name: "Nobody" } as Company)).toEqual([]);
  });

  it("registers a reviewer for every seeded company", async () => {
    const { companies } = await getStore().read();
    expect(companies.every((c) => (c.reviewers ?? []).length > 0)).toBe(true);
  });

  it("refuses a decision from a name the company has not registered, even a person's", async () => {
    const proofId = await waitingProof("co-kaari");
    const bot = await status(() => decide({ proofId, companyId: "co-kaari", reviewer: "AI bot", decision: "pass", feedback: FEEDBACK }));
    const stranger = await status(() => decide({ proofId, companyId: "co-kaari", reviewer: "Eeva Example", decision: "pass", feedback: FEEDBACK }));
    expect(bot).toEqual({ status: 400, message: NAMED_PERSON_NEEDED });
    expect(stranger.status).toBe(403);
    expect(stranger.message).toContain("add yourself as a reviewer first");
    expect((await getStore().read()).decisions.some((d) => d.proofId === proofId)).toBe(false);
  });

  it("lets a person decide after the explicit step, and logs the step", async () => {
    const proofId = await waitingProof("co-kaari");
    expect(await addReviewer("co-kaari", "  Eeva   Example ")).toEqual({ companyId: "co-kaari", reviewers: ["Anna Koivisto", "Eeva Example"] });
    await addReviewer("co-kaari", "eeva example");
    const { decision } = await decide({ proofId, companyId: "co-kaari", reviewer: "Eeva Example", decision: "pass", feedback: FEEDBACK });
    const data = await getStore().read();
    expect(decision.reviewer).toBe("Eeva Example");
    expect(data.companies.find((c) => c.id === "co-kaari")?.reviewers).toEqual(["Anna Koivisto", "Eeva Example"]);
    expect(data.audit.filter((e) => e.action === "Added a reviewer")).toHaveLength(1);
  });

  it.each(["AI bot", "auto", "System", "x", "", "GPT model", "a".repeat(81)])("refuses to register %j", async (name) => {
    expect(await status(() => addReviewer("co-kaari", name))).toEqual({ status: 400, message: NAMED_PERSON_NEEDED });
  });

  it("answers 404 for an unknown company", async () => {
    expect((await status(() => addReviewer("co-none", "Eeva Example"))).status).toBe(404);
  });
});
