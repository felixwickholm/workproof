import { describe, expect, it } from "vitest";
import * as copy from "./copy";

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);

/** Every line of the page as plain strings. */
const ALL_LINES: string[] = [
  copy.HEADLINE,
  copy.SUB_LINE,
  ...copy.DOORS.flatMap((d) => [d.label, d.line]),
  copy.TOUR_LABEL,
  copy.TRY_LABEL,
  copy.FOOT_LINE,
  ...copy.EVENT_STEPS,
  ...copy.storyTitle(9),
  ...copy.STORY_LINES,
  copy.SCORE_RULE,
  copy.SCORE_HOW,
  copy.NAME_RULE,
  ...copy.CLOSING,
];

describe("landing copy", () => {
  it("keeps every sentence at 20 words or fewer", () => {
    for (const line of ALL_LINES) for (const s of sentences(line)) expect(words(s), s).toBeLessThanOrEqual(20);
  });

  it("keeps the words above the doors to one headline and one sub-line", () => {
    expect(words(copy.HEADLINE)).toBeLessThanOrEqual(8);
    expect(words(copy.SUB_LINE)).toBeLessThanOrEqual(12);
  });

  it("keeps the front door under 60 words: headline, sub-line, doors and the two actions", () => {
    const front = [copy.HEADLINE, copy.SUB_LINE, ...copy.DOORS.flatMap((d) => [d.label, d.line]), copy.TOUR_LABEL, copy.TRY_LABEL];
    expect(words(front.join(" "))).toBeLessThan(60);
  });

  it("shows the event in five steps, in order", () => {
    expect(copy.EVENT_STEPS).toHaveLength(5);
    expect(copy.EVENT_STEPS[1]).toBe("The company scores the work.");
  });

  it("tells the story as merit, with the reviewer's total", () => {
    expect(copy.storyTitle(9)).toEqual(["Her CV got no answer.", "Her work got 9 of 10."]);
    expect(copy.storyTitle(8.6)[1]).toBe("Her work got 8.6 of 10.");
    expect(copy.storyTitle(null)[1]).toBe("Her work got the interview.");
    for (const line of ALL_LINES) expect(line).not.toMatch(/Kyiv|cleaner|abroad|immigrant|nationality/i);
  });

  it("never says that nobody is scored or ranked", () => {
    for (const line of ALL_LINES) expect(line).not.toMatch(/no score|no rank|never ranked|nobody is (scored|ranked)|not ranked/i);
    expect(copy.SCORE_RULE).toBe("People score the work. The AI never does.");
  });
});
