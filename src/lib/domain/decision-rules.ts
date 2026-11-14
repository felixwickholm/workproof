/** Rules for a human decision, shared by the API and the decision form. */

export const MIN_FEEDBACK_CHARS = 20;
export const MIN_FEEDBACK_WORDS = 4;

/** Words that contain at least one letter, so "...." or "1 2 3 4" never count as feedback. */
export function wordsWithLetters(text: string): number {
  return text.split(/\s+/).filter((word) => /\p{L}/u.test(word)).length;
}

/** The plain reason a reviewer name or feedback is not enough, or undefined. Shared with the form. */
export function decisionInputProblem(reviewer: string, feedback: string): string | undefined {
  if ((reviewer.trim().match(/\p{L}/gu) ?? []).length < 2) return "Add the name of the person who decided";
  const text = feedback.trim();
  if (text.length < MIN_FEEDBACK_CHARS || wordsWithLetters(text) < MIN_FEEDBACK_WORDS) {
    return `Feedback needs at least ${MIN_FEEDBACK_WORDS} words and ${MIN_FEEDBACK_CHARS} characters, so the person learns something`;
  }
  return undefined;
}
