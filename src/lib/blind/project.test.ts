import { describe, expect, it } from "vitest";
import type { OwnProof } from "@/lib/domain/types";
import { blindWork } from "./blind-work";
import { toBlindProof, toOwnProof } from "./project";

const challenge = {
  id: "ch-plate",
  title: "Plate today's lunch",
  coreSkills: [{ id: "food-safety", label: "Food safety", why: "Guests trust the kitchen." }],
  proofKind: "photo" as const,
};

const base = {
  proofId: "proof_test_1",
  challenge,
  work: "Separate board, then plate.",
  explain: [{ question: "Why this order?", answer: "Cross-contact first.", spoken: true }],
  attachment: { kind: "photo" as const, src: "/demo/plate.jpg", alt: "A plate with rice and salad." },
  spoken: true,
  aiSummary: "2 sentences",
  redactions: { names: 1, contacts: 0, places: 1, schools: 0, employers: 0, other: 0 },
  submittedAt: "2026-11-14T10:00:00.000Z",
};

/** Identity fields a careless spread could carry into a projection. */
const SMUGGLED = { talentId: "t_secret", name: "Olena Kovalenko", contact: "olena@example.org", exif: "GPS 60.2,24.8", originalAnswer: "raw text" };

describe("blind projection", () => {
  it("carries the proof kind, the picture and the spoken flags", () => {
    const own = toOwnProof(base);
    const blind = toBlindProof(own);
    expect(blind.proofKind).toBe("photo");
    expect(blind.attachment).toEqual(base.attachment);
    expect(blind.spoken).toBe(true);
    expect(blind.explain[0].spoken).toBe(true);
    expect(blind.hiddenCount).toBe(2);
    expect(blind).not.toHaveProperty("redactions");
  });

  it("keeps out every field it does not name, at every level", () => {
    const own = toOwnProof({
      ...base,
      ...SMUGGLED,
      challenge: { ...challenge, ...SMUGGLED },
      explain: [{ ...base.explain[0], ...SMUGGLED }],
      attachment: { ...base.attachment, ...SMUGGLED },
    } as typeof base);
    const tainted = { ...own, ...SMUGGLED, attachment: { ...own.attachment, ...SMUGGLED } } as OwnProof;
    for (const view of [own, toBlindProof(tainted)]) {
      const text = JSON.stringify(view);
      for (const value of Object.values(SMUGGLED)) expect(text).not.toContain(value);
    }
  });

  it("leaves optional fields out instead of sending them empty", () => {
    const blind = toBlindProof(toOwnProof({ ...base, attachment: undefined, spoken: undefined, explain: [{ question: "Q", answer: "A" }] }));
    expect(Object.keys(blind)).not.toContain("attachment");
    expect(Object.keys(blind)).not.toContain("spoken");
    expect(Object.keys(blind.explain[0])).toEqual(["question", "answer"]);
  });

  it("runs the picture's description through the blind layer", () => {
    const blind = blindWork("Plated as asked.", [], { name: "Olena Kovalenko" }, {
      kind: "photo",
      src: "/demo/plate.jpg",
      alt: "Olena Kovalenko's plate, photographed at olena@example.org's kitchen",
    });
    expect(blind.attachment?.alt).not.toMatch(/Olena|Kovalenko|example\.org/);
    expect(blind.report.names + blind.report.contacts).toBeGreaterThan(0);
  });
});
