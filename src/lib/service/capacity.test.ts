import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { makeRoom, MAX_PROOFS } from "./capacity";
import { ServiceError } from "./support";

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

  it("refuses with 429 when only event proofs remain", () => {
    const data = fill("event");
    expect(() => makeRoom(data)).toThrow(ServiceError);
  });
});
