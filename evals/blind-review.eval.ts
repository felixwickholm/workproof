import { beforeAll, describe, expect, it } from "vitest";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { POST as decisionsRoute } from "@/app/api/decisions/route";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { POST as followUpsRoute } from "@/app/api/followups/route";
import { POST as acceptRoute } from "@/app/api/meetings/[id]/accept/route";
import { POST as submissionsRoute } from "@/app/api/submissions/route";
import type { BlindProof, Decision, Meeting, ReviewQueue } from "@/lib/domain/types";
import { SUBMISSIONS } from "./fixtures/submissions";
import { call, keysDeep, record } from "./helpers";

const EVAL = "2 Blind review";
const CHALLENGE = "ch-tuulos-ml";
const COMPANY = "co-tuulos";
const FORBIDDEN_KEYS = ["name", "contact", "email", "photo", "talentId", "phone"];

describe("Eval 2: blind review", () => {
  const proofIds: string[] = [];
  let queue: ReviewQueue;

  beforeAll(async () => {
    await call(resetRoute, { method: "POST" });
    for (const [i, fixture] of SUBMISSIONS.entries()) {
      const { json: followUps } = await call<{ questions: string[] }>(followUpsRoute, {
        body: { challengeId: CHALLENGE, answer: fixture.answer },
      });
      const { status, json } = await call<{ proof: BlindProof }>(submissionsRoute, {
        body: {
          challengeId: CHALLENGE,
          talent: { id: `eval-talent-${i}`, name: fixture.name, contact: fixture.contact },
          answer: fixture.answer,
          explain: followUps.questions.map((question, q) => ({ question, answer: q === 0 ? fixture.explain : "Same reasoning." })),
          shareWithSimilar: true,
        },
      });
      expect(status).toBe(200);
      proofIds.push(json.proof.proofId);
    }
    queue = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json;
  });

  it("all 12 proofs are in the queue", () => {
    const ids = new Set(queue.proofs.map((p) => p.proofId));
    expect(proofIds.every((id) => ids.has(id))).toBe(true);
  });

  it("no planted identity string appears in the serialized queue", () => {
    const serialized = JSON.stringify(queue).toLowerCase();
    const leaks = SUBMISSIONS.flatMap((s) => s.planted.filter((p) => serialized.includes(p.toLowerCase())).map((p) => `${s.name}: ${p}`));
    const planted = SUBMISSIONS.reduce((n, s) => n + s.planted.length, 0);
    record(EVAL, "planted strings in reviewer payload", `${leaks.length} of ${planted}`, leaks.length === 0);
    expect(leaks).toEqual([]);
  });

  it("proof payloads have no identity keys", () => {
    const keys = new Set(keysDeep([...queue.proofs, ...queue.secondLook]));
    const found = FORBIDDEN_KEYS.filter((k) => keys.has(k));
    record(EVAL, "identity keys in proof payloads", found.length ? found.join(", ") : "none", found.length === 0);
    expect(found).toEqual([]);
  });

  it("identity appears only after the person accepts the meeting", async () => {
    const proofId = proofIds[0];
    const { json } = await call<{ decision: Decision; meeting: Meeting }>(decisionsRoute, {
      body: { proofId, companyId: COMPANY, reviewer: "Anna Koivisto", decision: "meet", feedback: "Clear reasoning on the split. We would like to talk about it." },
    });
    const before = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json;
    const invited = before.decided.find((d) => d.proof.proofId === proofId);
    expect(invited?.identity).toBeUndefined();
    expect(JSON.stringify(before)).not.toContain("Haddad");

    await call(acceptRoute, { method: "POST", params: { id: json.meeting.id } });
    const after = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json;
    const accepted = after.decided.find((d) => d.proof.proofId === proofId);
    const ok = accepted?.identity?.name === "Leila Haddad";
    record(EVAL, "identity hidden until accepted", ok ? "hidden, then shown" : "wrong", ok);
    expect(ok).toBe(true);
  });
});
