import { checkFeedback, MIN_SENTENCES, type FeedbackCheck } from "@/lib/domain/feedback-check";
import { isNamedReviewer } from "@/lib/domain/decision-rules";

/**
 * The header that carries the visitor's own private key to the table's invitation routes.
 * A header, not the address, so the key never lands in a log line or the browser history.
 */
export const VISITOR_KEY_HEADER = "x-workproof-key";

/** The longest first name the big screen shows. */
export const MAX_SHOWN_NAME = 40;

/**
 * The table's invitation follows the employer's decision rule: a named person and two sentences
 * someone can learn from. Shared by the invite sheet and the API, so both say the same thing.
 */
export function inviteCheck(host: string, message: string): FeedbackCheck {
  const check = checkFeedback(host, message);
  // Once the words are ready, the only thing left can be the name; say it the table's way.
  if (check.waitingFor && check.sentences >= MIN_SENTENCES && !isNamedReviewer(host)) return { ...check, waitingFor: "Add your name." };
  return check;
}

/** Why a first name cannot go on the big screen, or undefined. A letter is required, so "." is never a name. */
export function shownNameProblem(firstName: string): string | undefined {
  const name = firstName.trim();
  if (!/\p{L}/u.test(name)) return "Type your first name to accept.";
  if ([...name].length > MAX_SHOWN_NAME) return `A first name of up to ${MAX_SHOWN_NAME} letters is enough.`;
  return undefined;
}
