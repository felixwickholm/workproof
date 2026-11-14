import { describe, expect, it } from "vitest";
import { cardWords } from "./autoplay";
import { CHAPTERS, END_ACTIONS, storySteps } from "./steps";

/**
 * The copy budget of every card. Each card says what is happening and why, in plain words: one short
 * headline and one short line (two only where the why needs it), so a visitor reads it at a glance.
 */
const MAX_TITLE_WORDS = 9;
const MAX_BODY_SENTENCES = 2;
const MAX_BODY_WORDS = 13;
const MAX_CARD_WORDS = 22;

/**
 * Words the cards never use: jargon, a name the plain-language pass replaced, CVs (the v4 brief
 * removes them from the UI), anonymity as a lead, and anything that sounds like a machine at work.
 */
const BANNED = [
  "proof",
  "reviewer",
  "employer",
  "organiser",
  "organizer",
  "redact",
  "consent",
  "passport",
  "second look",
  "cv",
  "résumé",
  "resume",
  "anonym",
  "blind",
  "loading",
  "please wait",
  "olena",
  "katja",
  "looking for work",
  "hiring mode",
  // No legal review has been done: the product is built to meet the rules, never called compliant.
  "compliant",
  "compliance",
];

const words = (text: string) => text.split(/\s+/).filter(Boolean);
/** Sentences end in a full stop, a question mark or an exclamation mark. */
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
const hasWord = (text: string, banned: string) => new RegExp(`(^|[^a-z])${banned}`, "i").test(text);

describe("tour copy budget", () => {
  it.each(storySteps.map((step) => [step.id, step] as const))("%s fits the budget", (_, step) => {
    expect(words(step.title).length, step.title).toBeLessThanOrEqual(MAX_TITLE_WORDS);
    expect(sentences(step.title).length, step.title).toBeLessThanOrEqual(2);
    expect(step.body, step.id).toBeTruthy();
    const body = step.body ?? "";
    expect(sentences(body).length, body).toBeLessThanOrEqual(MAX_BODY_SENTENCES);
    expect(words(body).length, body).toBeLessThanOrEqual(MAX_BODY_WORDS);
    expect(cardWords(step).length, step.id).toBeLessThanOrEqual(MAX_CARD_WORDS);
  });

  it("uses British plain style: full stops, no exclamation marks, no dashes as punctuation", () => {
    for (const step of storySteps) {
      const text = `${step.title} ${step.body ?? ""}`;
      expect(text, step.id).not.toMatch(/[!—–]/);
      expect(step.title, step.id).toMatch(/\.$/);
      expect(step.body ?? ".", step.id).toMatch(/\.$/);
    }
  });

  it("never uses a banned word on a card, a chapter or a button", () => {
    const texts = [...storySteps.flatMap((step) => [step.title, step.body ?? ""]), ...CHAPTERS.map((c) => c.label), ...END_ACTIONS.map((a) => a.label)];
    for (const text of texts) {
      for (const banned of BANNED) expect(hasWord(text, banned), `"${text}" uses "${banned}"`).toBe(false);
    }
  });

  it("checks what it says: the counters catch a card over budget and a banned word", () => {
    expect(words("One two three four five six seven eight nine ten").length).toBeGreaterThan(MAX_TITLE_WORDS);
    expect(sentences("He picks a challenge. He does it. He says why.")).toHaveLength(3);
    expect(hasWord("Skip the CV.", "cv")).toBe(true);
    expect(hasWord("He can type or talk.", "cv")).toBe(false);
  });
});
