import { describe, expect, it } from "vitest";
import { AI_DOES, AI_NEVER, COMPARISON, FAIR_QUESTIONS, PRECEDENT, PROMISE, SIDES, STEPS } from "./content";

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);

const ALL_LINES: string[] = [
  PROMISE,
  ...STEPS.flatMap((s) => [s.headline, s.sentence]),
  ...SIDES.flatMap((s) => [s.title, ...s.points]),
  ...AI_DOES,
  ...AI_NEVER,
  ...FAIR_QUESTIONS.flatMap((q) => [q.question, q.answer]),
  ...COMPARISON.flat(),
  `${PRECEDENT.before} ${PRECEDENT.term}. ${PRECEDENT.after}`,
];

describe("/how-it-works copy", () => {
  it("tells the product in six steps, each a 4 to 8 word headline and at most 16 words under it", () => {
    expect(STEPS).toHaveLength(6);
    for (const step of STEPS) {
      expect(words(step.headline), step.headline).toBeGreaterThanOrEqual(4);
      expect(words(step.headline), step.headline).toBeLessThanOrEqual(8);
      expect(words(step.sentence), step.sentence).toBeLessThanOrEqual(16);
    }
  });

  it("gives each side three short points", () => {
    for (const side of SIDES) expect(side.points).toHaveLength(3);
  });

  it("answers six fair questions in at most two short sentences each, scoring among them", () => {
    expect(FAIR_QUESTIONS).toHaveLength(6);
    for (const { answer } of FAIR_QUESTIONS) {
      expect(sentences(answer).length, answer).toBeLessThanOrEqual(2);
      for (const s of sentences(answer)) expect(words(s), s).toBeLessThanOrEqual(20);
    }
    expect(FAIR_QUESTIONS.map((q) => q.question)).toContain("Is scoring people fair?");
  });

  it("keeps every sentence at 20 words or fewer", () => {
    for (const line of ALL_LINES) for (const s of sentences(line)) expect(words(s), s).toBeLessThanOrEqual(20);
  });

  it("sells one thing, on merit, with no line about origin", () => {
    expect(PROMISE).toBe("Companies see how well people do the real work before they meet them.");
    for (const line of ALL_LINES) expect(line).not.toMatch(/Kyiv|cleaner|abroad|immigrant|nationality|new to Finnish/i);
  });

  it("says a person scores, and never that nobody is scored or ranked", () => {
    expect(COMPARISON).toContainEqual(["An algorithm gives a match score", "A person scores the work and signs it"]);
    for (const line of ALL_LINES.filter((l) => !AI_NEVER.includes(l as (typeof AI_NEVER)[number]))) {
      expect(line).not.toMatch(/no score|no rank|nobody is (scored|ranked)|not ranked/i);
    }
    expect(AI_NEVER).toContain("Never gives a score.");
  });
});
