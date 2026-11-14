/**
 * Fixed guardrail sentences, shared by the API, the screens and the docs so the promise reads the same everywhere.
 * Each one is a fact the code enforces, not a slogan.
 */

/** What every reviewer reads under every proof. Identical for all, so the line itself says nothing about a person. */
export const REVIEWER_HIDDEN_LINE = "Personal details are hidden before anyone reads the work.";

/** Why a decision, or a new reviewer, was refused: no name, or a name that looks like software. */
export const NAMED_PERSON_NEEDED = "A decision needs a named person.";

/** The "0 automated decisions" claim, said the way the code backs it. */
export const NO_AUTOMATED_DECISIONS_LINE =
  "0 automated decisions: the API has no path for one, every decision names a registered person, and the audit log is counted, not assumed.";
