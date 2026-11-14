import { describe, expect, it } from "vitest";
import type { BlindProof, ReviewQueue } from "@/lib/domain/types";
import { firstToOpen } from "./review-order";

const proof = (proofId: string): BlindProof => ({
  proofId,
  label: `Proof ${proofId}`,
  challengeId: "ch-1",
  challengeTitle: "Plan tomorrow's visits",
  skills: [],
  proofKind: "plan",
  work: "Work",
  explain: [],
  glance: "",
  submittedAt: "2026-11-14T08:00:00.000Z",
});

const answered = (proofId: string, decidedAt: string): ReviewQueue["decided"][number] => ({
  proof: proof(proofId),
  decision: { id: `d-${proofId}`, proofId, companyId: "co-kaari", reviewer: "Anna Koivisto", decision: "pass", feedback: "Two sentences. Here.", decidedAt },
});

const empty = { proofs: [], secondLook: [], decided: [] };

describe("firstToOpen", () => {
  it("opens the oldest proof still to read", () => {
    expect(firstToOpen({ ...empty, proofs: [proof("a"), proof("b")], secondLook: [{ ...proof("s"), sharedSkills: [] }] })).toBe("a");
  });

  it("then the first Second look", () => {
    expect(firstToOpen({ ...empty, secondLook: [{ ...proof("s"), sharedSkills: [] }], decided: [answered("d", "2026-11-14T09:00:00.000Z")] })).toBe("s");
  });

  it("then the latest answer", () => {
    const decided = [answered("old", "2026-11-13T09:00:00.000Z"), answered("new", "2026-11-14T09:00:00.000Z")];
    expect(firstToOpen({ ...empty, decided })).toBe("new");
  });

  it("opens nothing in an empty queue", () => {
    expect(firstToOpen(empty)).toBeNull();
  });
});
