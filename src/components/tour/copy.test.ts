import { describe, expect, it } from "vitest";
import { cardWords } from "./autoplay";
import { modeChip, TOUR_KINDS, tours } from "./steps";

/**
 * The copy budget of every tour card. People have no time to read, so a card says only what happens
 * now, in words a 9-year-old knows: one headline and at most one short sentence.
 */
const MAX_TITLE_WORDS = 8;
const MAX_SENTENCE_WORDS = 12;
const MAX_CARD_WORDS = 20;

/** Words the cards never use: jargon, or a name the plain-language pass replaced. */
const BANNED = ["proof", "reviewer", "employer", "organiser", "organizer", "redact", "consent", "passport", "second look"];

const words = (text: string) => text.split(/\s+/).filter(Boolean);
/** Sentences end in a full stop, a question mark or an exclamation mark. */
const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);

const cards = TOUR_KINDS.flatMap((kind) => tours[kind].steps.map((step) => ({ kind, step })));

describe("tour copy budget", () => {
  it.each(cards.map(({ kind, step }) => [`${kind} ${step.id}`, step] as const))("%s fits the budget", (_, step) => {
    expect(words(step.title).length, step.title).toBeLessThanOrEqual(MAX_TITLE_WORDS);
    expect(sentences(step.title), step.title).toHaveLength(1);
    if (step.body) {
      expect(sentences(step.body), step.body).toHaveLength(1);
      expect(words(step.body).length, step.body).toBeLessThanOrEqual(MAX_SENTENCE_WORDS);
    }
    expect(cardWords(step).length).toBeLessThanOrEqual(MAX_CARD_WORDS);
  });

  it("names no job, company or person the demo world may drop", () => {
    const texts = cards.flatMap(({ step }) => [step.title, step.body ?? ""]).join(" ");
    for (const name of ["Kaari", "Anna", "doctor", "carer", "Kyiv", "nurse"]) expect(texts).not.toContain(name);
  });

  it("never uses a banned word on a card, a chip or a button", () => {
    const texts = [
      ...cards.flatMap(({ step }) => [step.title, step.body ?? ""]),
      ...(["seeker", "employer", "city"] as const).map((mode) => modeChip(mode) ?? ""),
      ...TOUR_KINDS.flatMap((kind) => tours[kind].end.map((action) => action.label)),
    ];
    for (const text of texts) {
      for (const banned of BANNED) expect(text.toLowerCase(), text).not.toContain(banned);
    }
  });

  it("checks what it says: the counters catch a card over budget", () => {
    const long = { title: "One two three four five six seven eight nine", body: "Short." };
    expect(words(long.title).length).toBeGreaterThan(MAX_TITLE_WORDS);
    expect(sentences("Her name is hidden. She says yes.")).toHaveLength(2);
    expect(cardWords({ title: "A b c d e f g h", body: "a b c d e f g h i j k l m" })).toHaveLength(21);
  });
});
