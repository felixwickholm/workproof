import { beforeEach, describe, expect, it, vi } from "vitest";

/** No request scope by default; a test can turn on a request that carries no sandbox cookie. */
const request = { inScope: false };

vi.mock("next/headers", () => {
  const scope = () => {
    if (!request.inScope) throw new Error("`cookies` was called outside a request scope.");
  };
  return {
    cookies: async () => (scope(), { get: () => undefined }),
    headers: async () => (scope(), new Headers()),
  };
});

const { getSession } = await import("./demo");

beforeEach(() => {
  request.inScope = false;
});

describe("demo session", () => {
  it("gives the persona key to the event's owner: outside a request, the default event's own caller", async () => {
    const session = await getSession();
    expect(session.persona?.talentId).toBeTruthy();
  });

  it("gives no persona key to a request without a sandbox, only the stage", async () => {
    request.inScope = true;
    expect(await getSession()).toEqual({ code: null, persona: null, stage: expect.any(String) });
  });
});

describe("withVisitorWork", () => {
  it("keeps the visitor's own work and published challenge when the story is rebuilt, and drops nothing seeded twice", async () => {
    const { buildSeed } = await import("@/lib/seed");
    const { withVisitorWork } = await import("./demo");
    const now = new Date("2026-11-15T10:00:00Z");
    const before = buildSeed(now, "invited");
    const challenge = { ...before.challenges[0], id: "ch_visitor", title: "A visitor's own challenge" };
    const seeded = before.submissions[0];
    const own = { ...seeded, id: "proof_visitor", talentId: "t_visitor", challengeId: challenge.id };
    const asPersona = { ...seeded, id: "proof_persona_own", talentId: before.demo.personaTalentId };
    before.challenges.push(challenge);
    before.talents.push({ id: "t_visitor", name: "Visitor", contact: "v@example.org" });
    before.submissions.push(own, asPersona);
    before.proofs.push({ ...before.proofs[0], proofId: own.id }, { ...before.proofs[0], proofId: asPersona.id });

    const fresh = buildSeed(now, "sent");
    const after = withVisitorWork(fresh, before);
    expect(after.challenges.map((c) => c.id)).toContain("ch_visitor");
    expect(after.submissions.map((s) => s.id)).toContain("proof_visitor");
    expect(after.proofs.map((p) => p.proofId)).toContain("proof_visitor");
    expect(after.talents.some((t) => t.id === "t_visitor")).toBe(true);
    // Work sent as the demo person is part of the story and is rebuilt with it.
    expect(after.submissions.map((s) => s.id)).not.toContain("proof_persona_own");
    expect(after.submissions.length).toBe(fresh.submissions.length + 1);
  });
});
