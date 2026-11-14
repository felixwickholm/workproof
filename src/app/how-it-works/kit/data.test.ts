import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { HIDDEN_TOKEN } from "@/components/proof/mark-hidden";
import { buildHowItWorksData } from "./data";

const now = new Date("2026-11-14T10:00:00Z");
const seed = buildSeed(now, "invited");
const how = buildHowItWorksData(seed, now);
const persona = seed.demo.personaName;

describe("buildHowItWorksData", () => {
  it("takes the headline numbers from the event, with no automated decisions", () => {
    const { counts, impact } = how;
    expect(counts.took).toBeGreaterThan(0);
    expect(counts.took).toBe(impact.took);
    expect(impact.scored).toBeLessThanOrEqual(impact.took);
    expect(impact.invited).toBeLessThanOrEqual(impact.took);
    expect(impact.met).toBeLessThanOrEqual(impact.invited);
    expect(counts.automatedDecisions).toBe(0);
  });

  it("maps one flow per event proof and only to companies at the event", () => {
    const ids = new Set(how.map.companies.map((c) => c.id));
    expect(how.map.flows).toHaveLength(how.counts.took);
    expect(how.map.flows.every((f) => ids.has(f.companyId))).toBe(true);
  });

  it("shows the story proof with the persona's name hidden and the reviewer's own answer", () => {
    const { story } = how;
    expect(story.original).toContain(persona);
    expect(story.blind).not.toContain(persona);
    expect(story.blind).toMatch(HIDDEN_TOKEN);
    expect(story.hiddenCount).toBeGreaterThan(0);
    expect(story.reviewer.length).toBeGreaterThan(0);
    expect(story.feedback.length).toBeGreaterThan(0);
  });

  it("lists the story task's 3 to 5 core skills, with points only from 1 to 5", () => {
    const { skills, total } = how.story;
    expect(skills.length).toBeGreaterThanOrEqual(3);
    expect(skills.length).toBeLessThanOrEqual(5);
    for (const s of skills) expect(s.points === null || (s.points >= 1 && s.points <= 5)).toBe(true);
    expect(total === null || (total >= 0 && total <= 10)).toBe(true);
  });

  it("carries no person's name into what a company would read", () => {
    const text = JSON.stringify([how.story.blind, how.story.thinking, how.map]);
    expect(text).not.toContain(persona);
    expect(text).not.toMatch(/talentId|t_[0-9a-f]{8}-/);
  });

  it("finds the persona's invitation from the company that read the story proof", () => {
    expect(how.invitation?.companyName).toBe(how.story.companyName);
  });
});
