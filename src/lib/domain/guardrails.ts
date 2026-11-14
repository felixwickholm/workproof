/**
 * Fixed guardrail sentences, shared by the API, the screens and the docs so the promise reads the same everywhere.
 * Each one says what the code does, and where it stops.
 */

/** How identity is hidden, in full: rules over the text, and the person's own check for a picture. */
export const HIDING_LINE =
  "Known personal details are removed by rules before anyone reads the work. Rules can miss some; pictures are checked by the person, not by software.";

/** What every reviewer reads under every proof. Identical for all, so the line itself says nothing about a person. */
export const REVIEWER_HIDDEN_LINE = "Personal details are removed by rules before review. Some can remain.";

/** What a model may read: the blind text only, and the built-in designer needs no model at all. */
export const MODEL_INPUT_LINE = "Text is redacted by the same rules before it reaches a model. The built-in designer runs without any model.";

/** Why a decision, or a new reviewer, was refused: no name, or a name that looks like software. */
export const NAMED_PERSON_NEEDED = "A decision needs a named person.";

/** The decision rule, said the way the code backs it, including what a demo without sign-in cannot check. */
export const NO_AUTOMATED_DECISIONS_LINE =
  "WorkProof has no automated decision feature. A decision is recorded with the name of a reviewer registered for the company and a written reason. This demo has no sign-in, so the name is not verified.";
