import { decisionInputProblem, wordsWithLetters } from "./decision-rules";

/** The written answer the form asks for: two sentences a person can learn from. */
export const MIN_SENTENCES = 2;

/** Sentences with at least two words, so "Ok." or a stray full stop never counts as one. */
export function countSentences(text: string): number {
  return text
    .split(/[.!?]+(?:\s+|$)/)
    .map((part) => part.trim())
    .filter((part) => wordsWithLetters(part) >= 2).length;
}

export interface FeedbackCheck {
  sentences: number;
  characters: number;
  /** Why the decision buttons wait, in plain words, or null when the answer is ready to send. */
  waitingFor: string | null;
}

/**
 * The shared API rule (a named reviewer, enough words) plus the two sentences the form asks for.
 * The reason names the first thing still missing, so a disabled button always says why.
 */
export function checkFeedback(reviewer: string, feedback: string): FeedbackCheck {
  const sentences = countSentences(feedback);
  const characters = feedback.trim().length;
  let waitingFor: string | null = null;
  if (characters === 0) waitingFor = "Write your answer to the person first.";
  else if (sentences < MIN_SENTENCES) waitingFor = `Write ${MIN_SENTENCES - sentences} more ${MIN_SENTENCES - sentences === 1 ? "sentence" : "sentences"}.`;
  else {
    const problem = decisionInputProblem(reviewer, feedback);
    if (problem) waitingFor = /[.!?]$/.test(problem) ? problem : `${problem}.`;
  }
  return { sentences, characters, waitingFor };
}
