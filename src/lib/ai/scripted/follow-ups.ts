import type { Challenge } from "@/lib/domain/types";
import { findJudgement } from "@/lib/guard/no-judgement";
import { pick } from "@/lib/util/hash";
import { flawsFor, roleFor } from "./compose";

const SHORT_ANSWER_WORDS = 12;
const QUOTE_WORDS = 8;

const WHY_TEMPLATES = [
  (quote: string) => `You wrote "${quote}". Why did you start there, and how would you check you are right?`,
  (quote: string) => `You wrote "${quote}". What made you choose this over the other things you noticed?`,
  (quote: string) => `You wrote "${quote}". What would go wrong if the team skipped this?`,
];

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 4);
}

/** A short phrase from the answer, preferably where it talks about a planted flaw. */
export function quoteFrom(challenge: Challenge, answer: string): string | undefined {
  const sentences = sentencesOf(answer);
  if (sentences.length === 0) return undefined;
  const cues = flawsFor(challenge).flatMap((flaw) => flaw.cues);

  let sentence = sentences.find((s) => cues.some((cue) => s.toLowerCase().includes(cue)));
  sentence ??= [...sentences].sort((a, b) => b.length - a.length)[0];

  const words = sentence.split(/\s+/);
  const cueAt = words.findIndex((w) => cues.some((cue) => w.toLowerCase().includes(cue.split(" ")[0])));
  // Start at the sentence start when the cue is near it, else two words before the cue.
  const start = cueAt < QUOTE_WORDS - 2 ? 0 : Math.max(0, Math.min(cueAt - 2, words.length - QUOTE_WORDS));
  const window = words.slice(cueAt < 0 ? 0 : start, (cueAt < 0 ? 0 : start) + QUOTE_WORDS);
  // End at the first clause break once the quote has three words, so it reads as a phrase.
  const stop = window.findIndex((w, i) => i >= 2 && /[:;,.]$/.test(w));
  const quote = window
    .slice(0, stop < 0 ? window.length : stop + 1)
    .join(" ")
    .replace(/["“”]/g, "'")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N})]+$/gu, "");
  if (quote.split(/\s+/).length < 3 || findJudgement(quote).length > 0) return undefined;
  return quote;
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
