import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { HIDDEN_TOKEN } from "@/components/proof/mark-hidden";
import { buildLandingData, MOSAIC } from "./data";

const now = new Date("2026-11-14T10:00:00Z");
const landing = buildLandingData(buildSeed(now, "invited"), now);

describe("buildLandingData", () => {
  it("takes the hero counts from the city totals, with no automated decisions", () => {
    expect(landing.counts.proofs).toBeGreaterThan(0);
    expect(landing.counts.writtenAnswers).toBeLessThanOrEqual(landing.counts.proofs);
    expect(landing.counts.automatedDecisions).toBe(0);
    expect(landing.counts.writtenAnswers).toBe(landing.city.totals.proofsAnswered);
  });

  it("maps one flow per event proof and only to companies at the event", () => {
    const ids = new Set(landing.map.companies.map((c) => c.id));
    expect(landing.map.flows).toHaveLength(landing.counts.proofs);
    expect(landing.map.flows.every((f) => ids.has(f.companyId))).toBe(true);
  });

  it("shows Olena's story proof with her details hidden and Anna's own answer", () => {
    const { story } = landing;
    expect(story.original).toContain("Olena Kovalenko");
    expect(story.blind).not.toContain("Olena");
    expect(story.blind).toMatch(HIDDEN_TOKEN);
    expect(story.hiddenCount).toBe(7);
    expect(story.reviewer).toBe("Anna Koivisto");
    expect(story.feedback).toMatch(/blood thinner/);
  });

  it("finds all seven mosaic proofs, one per kind of proof", () => {
    expect(landing.fragments.map((f) => f.slot)).toEqual(MOSAIC.map((m) => m.slot));
    expect(new Set(landing.fragments.map((f) => f.kind)).size).toBe(7);
    expect(landing.fragments.find((f) => f.slot === "voice")?.spoken).toBe(true);
    expect(landing.fragments.filter((f) => f.attachment).map((f) => f.slot)).toEqual(["photo", "design", "video"]);
  });

  it("carries no person's name into the fragments a company would read", () => {
    const text = JSON.stringify([landing.fragments, landing.employer.queue]);
    expect(text).not.toContain("Olena");
    expect(text).not.toMatch(/talentId|t_[0-9a-f]{8}-/);
  });

  it("builds the three mode views from the same event", () => {
    expect(landing.seeker.invitation?.companyName).toBe("Kaari Home Care");
    expect(landing.seeker.tasks).toHaveLength(2);
    expect(landing.employer.greeting.startsWith("Kaari Home Care. ")).toBe(true);
    expect(landing.employer.pipeline.map((p) => p.stage)).toEqual(["To read", "Answered", "Invited", "Accepted", "Met"]);
    expect(landing.city.greeting).toBe(`Espoo Talent Day. ${landing.city.totals.proofsAnswered} people got a written answer.`);
  });
});
