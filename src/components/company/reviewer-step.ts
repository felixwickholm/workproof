import { isListedReviewer, reviewerNameProblem } from "@/lib/domain/decision-rules";

/**
 * Where the signed name stands before a decision can be sent:
 * - `none`: nothing typed yet; the decision rule already asks for a name.
 * - `refused`: the name reads as no one or as software; the server's own sentence says why.
 * - `unregistered`: a person, but not registered for this company; one tap adds them.
 * - `registered`: the name may decide.
 */
export type ReviewerStanding = { kind: "none" } | { kind: "refused"; reason: string } | { kind: "unregistered" } | { kind: "registered" };

/** The one-tap step for a person who is not yet registered for the company. */
export function addReviewerLabel(companyName: string): string {
  return `Add me as a reviewer for ${companyName}`;
}

/** Why the decision buttons wait while the name is not registered. */
export const ADD_REVIEWER_FIRST = "Add yourself as a reviewer first.";

/**
 * The standing of a signed name against the company's registered reviewers. `refusedByServer` is a
 * name the server answered 403 for, so a stale list on the screen never hides the step.
 */
export function reviewerStanding(reviewers: readonly string[], name: string, refusedByServer?: string): ReviewerStanding {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { kind: "none" };
  const problem = reviewerNameProblem(trimmed);
  if (problem) return { kind: "refused", reason: problem };
  if (refusedByServer !== undefined && refusedByServer.trim() === trimmed) return { kind: "unregistered" };
  return isListedReviewer(reviewers, trimmed) ? { kind: "registered" } : { kind: "unregistered" };
}
