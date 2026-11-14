import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { checkPictureRoom, makeRoom, MAX_PROOFS, MAX_UPLOADED_PICTURES } from "./capacity";
import { appendAudit, MAX_AUDIT_EVENTS, ServiceError } from "./support";

function fill(kind: "event" | "taster") {
  const data = buildSeed(new Date("2026-11-14T12:00:00Z"));
  const challengeId = kind === "taster" ? "taster_x" : data.challenges[0].id;
  if (kind === "taster") data.challenges.push({ ...data.challenges[0], id: challengeId, kind: "taster", companyIds: [] });
  for (let i = data.proofs.length; i < MAX_PROOFS; i++) {
    const id = `proof_${i}`;
    data.submissions.push({ id, challengeId, talentId: "t", answer: "a", explain: [], shareWithSimilar: false, submittedAt: new Date(i * 1000).toISOString() });
    data.proofs.push({ ...data.proofs[0], proofId: id, challengeId });
  }
  return data;
}

describe("demo capacity", () => {
  it("drops the oldest taster proof first when full", () => {
    const data = fill("taster");
    const oldest = data.submissions.find((s) => s.challengeId === "taster_x")?.id;
    makeRoom(data);
    expect(data.proofs).toHaveLength(MAX_PROOFS - 1);
    expect(data.proofs.some((p) => p.proofId === oldest)).toBe(false);
  });

  it("takes the evicted proof's table invitation, decisions and meetings with it", () => {
    const data = fill("taster");
    const oldest = data.submissions.find((s) => s.challengeId === "taster_x")?.id ?? "";
    data.tableInvites = [{ proofId: oldest, host: "Anna Koivisto", message: "Come by. Bring the plan.", status: "invited", invitedAt: "2026-11-14T10:00:00Z" }];
    makeRoom(data);
    expect(data.tableInvites).toEqual([]);
    expect(data.submissions.some((s) => s.id === oldest)).toBe(false);
  });

  it("refuses with 429 when only event proofs remain", () => {
    const data = fill("event");
    expect(() => makeRoom(data)).toThrow(ServiceError);
  });

  it("refuses a visitor picture once the store holds the maximum, but not seed pictures", () => {
    const data = buildSeed(new Date("2026-11-14T12:00:00Z"));
    const picture = (src: string) => ({ kind: "photo" as const, src, alt: "A plate" });
    const add = (id: string, src: string) =>
      data.submissions.push({ id, challengeId: "c", talentId: "t", answer: "a", explain: [], attachment: picture(src), shareWithSimilar: false, submittedAt: "2026-11-14T10:00:00Z" });
    for (let i = 0; i < 20; i++) add(`seed_${i}`, "/demo/plate.jpg");
    for (let i = 0; i < MAX_UPLOADED_PICTURES - 1; i++) add(`own_${i}`, "data:image/jpeg;base64,/9j/");
    expect(() => checkPictureRoom(data)).not.toThrow();
    add("own_last", "data:image/jpeg;base64,/9j/");
    expect(() => checkPictureRoom(data)).toThrow(ServiceError);
  });

  it("keeps only the newest audit events", () => {
    const data = buildSeed(new Date("2026-11-14T12:00:00Z"));
    data.audit = [];
    for (let i = 0; i < MAX_AUDIT_EVENTS + 5; i++) appendAudit(data, { actor: "system", by: "Test", action: "Counted", detail: String(i) });
    expect(data.audit).toHaveLength(MAX_AUDIT_EVENTS);
    expect(data.audit[0].detail).toBe("5");
    expect(data.audit.at(-1)?.detail).toBe(String(MAX_AUDIT_EVENTS + 4));
  });
});
