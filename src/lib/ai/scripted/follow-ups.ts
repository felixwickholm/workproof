import type { Challenge } from "@/lib/domain/types";
import { isNeutral } from "@/lib/guard/check-draft";
import { pick } from "@/lib/util/hash";
import { flawsFor, roleFor } from "./compose";

const SHORT_ANSWER_WORDS = 12;
const QUOTE_WORDS = 8;

const WHY_TEMPLATES = [
  (quote: string) => `You wrote "${quote}". Why did you start there, and how would you check you are right?`,
  (quote: string) => `You wrote "${quote}". What made you choose this over the other things you noticed?`,
  (quote: string) => `You wrote "${quote}". What would go wrong if the team skipped this?`,
];

/** Sentences worth quoting: long enough, with nothing hidden and nothing about the person. */
function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 4 && !s.includes("[hidden]") && isNeutral(s));
}

const ELLIPSIS = "…";

/** A whole sentence is quoted while it stays this short, so the person reads their own thought complete. */
export const WHOLE_SENTENCE_CHARS = 140;

/** Quote marks inside the person's words become single ones, and edge punctuation goes. */
function clean(text: string): string {
  return text.replace(/["“”]/g, "'").replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N})']+$/gu, "");
}

/**
 * A part of a long sentence, cut at word boundaries around the cue, with an ellipsis at each cut end,
 * so a quote never stops mid-thought without saying so.
 */
function excerpt(words: readonly string[], cueAt: number): string {
  // Start at the sentence start when the cue is near it, else two words before the cue.
  const start = cueAt < QUOTE_WORDS - 2 ? 0 : Math.max(0, Math.min(cueAt - 2, words.length - QUOTE_WORDS));
  const end = Math.min(words.length, start + QUOTE_WORDS);
  const part = clean(words.slice(start, end).join(" "));
  return `${start > 0 ? ELLIPSIS : ""}${part}${end < words.length ? ELLIPSIS : ""}`;
}

/**
 * The person's own words to quote, preferably where they talk about a planted flaw: the whole sentence
 * when it is under about 140 characters, otherwise a part of it cut at word boundaries with an ellipsis.
 */
export function quoteFrom(challenge: Challenge, answer: string): string | undefined {
  const sentences = sentencesOf(answer);
  if (sentences.length === 0) return undefined;
  const cues = flawsFor(challenge).flatMap((flaw) => flaw.cues);

  let sentence = sentences.find((s) => cues.some((cue) => s.toLowerCase().includes(cue)));
  sentence ??= [...sentences].sort((a, b) => b.length - a.length)[0];

  const whole = clean(sentence);
  if (whole.length <= WHOLE_SENTENCE_CHARS) return whole.split(/\s+/).length >= 3 ? whole : undefined;

  const words = sentence.split(/\s+/);
  const cueAt = words.findIndex((w) => cues.some((cue) => w.toLowerCase().includes(cue.split(" ")[0])));
  const quote = excerpt(words, Math.max(0, cueAt));
  return isNeutral(quote) ? quote : undefined;
}

export function followUpQuestions(challenge: Challenge, answer: string): string[] {
  const trimmed = answer.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const quote = wordCount >= SHORT_ANSWER_WORDS ? quoteFrom(challenge, trimmed) : undefined;

  const why = quote
    ? pick(WHY_TEMPLATES, trimmed)(quote)
    : wordCount < SHORT_ANSWER_WORDS
      ? "Your answer is short. Walk us through the reasoning behind it: what did you look at first, and why?"
      : "Which change in your answer matters most to you, and why that one first?";

  if (challenge.kind === "taster") return [why];

  const constraint = pick(roleFor(challenge).constraints, `${challenge.id}:${trimmed}`);
  return [why, `If ${constraint}, what would you change in your answer?`];
}
