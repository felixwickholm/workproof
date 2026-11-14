import { NAMED_PERSON_NEEDED } from "./guardrails";

/** Rules for a human decision, shared by the API and the decision form. */

const MIN_FEEDBACK_CHARS = 20;
const MIN_FEEDBACK_WORDS = 4;

/** Words that contain at least one letter, so "...." or "1 2 3 4" never count as feedback. */
export function wordsWithLetters(text: string): number {
  return text.split(/\s+/).filter((word) => /\p{L}/u.test(word)).length;
}

/** True when a reviewer name has at least two letters, so "." or "-" never stands in for a person. */
export function isNamedReviewer(reviewer: string): boolean {
  return (reviewer.trim().match(/\p{L}/gu) ?? []).length >= 2;
}

/** The audit actions of a decision. The city counts decisions over the log by these, so they are fixed. */
export const DECISION_ACTIONS = { meet: "Chose to meet", pass: "Said not now, with a reason" } as const;

/** A reviewer name may be this long, as in the form field. */
const MAX_REVIEWER_CHARS = 80;

/** Whole words that name software, not a person: "AI bot", "auto-review", "GPT model". */
const SOFTWARE_NAME = /(?<![\p{L}\p{N}])(?:ai|bot|auto|system|gpt|model|script)(?![\p{L}\p{N}])/iu;

/** True when a name reads as software rather than a person. */
export function looksLikeSoftware(name: string): boolean {
  return SOFTWARE_NAME.test(name);
}

/** Spaces and case do not make another person: "anna  koivisto" is Anna Koivisto. */
export function sameReviewer(a: string, b: string): boolean {
  const plain = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("fi");
  return plain(a) === plain(b);
}

/** True when the name is on a company's list of registered reviewers. */
export function isListedReviewer(reviewers: readonly string[], name: string): boolean {
  return reviewers.some((registered) => sameReviewer(registered, name));
}

/** Why a name cannot be registered as a reviewer, or undefined: 2 to 80 characters, two letters, a person. */
export function reviewerNameProblem(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > MAX_REVIEWER_CHARS || !isNamedReviewer(trimmed) || looksLikeSoftware(trimmed)) return NAMED_PERSON_NEEDED;
  return undefined;
}

/** The plain reason a reviewer name or feedback is not enough, or undefined. Shared with the form. */
export function decisionInputProblem(reviewer: string, feedback: string): string | undefined {
  if (!isNamedReviewer(reviewer)) return "Add the name of the person who decided";
  if (looksLikeSoftware(reviewer)) return NAMED_PERSON_NEEDED;
  const text = feedback.trim();
  if (text.length < MIN_FEEDBACK_CHARS || wordsWithLetters(text) < MIN_FEEDBACK_WORDS) {
    return `Feedback needs at least ${MIN_FEEDBACK_WORDS} words and ${MIN_FEEDBACK_CHARS} characters, so the person learns something`;
  }
  return undefined;
}
