import { ApiError, errorText } from "@/lib/client/api";

/** The first non-empty line of the work, for a list preview. */
export function firstLine(work: string): string {
  return work.split("\n").find((line) => line.trim())?.trim() ?? "";
}

/** Validation messages from the API are written for people; show them. Anything else gets plain words. */
export function companyErrorText(error: unknown): string {
  if (error instanceof ApiError && (error.status === 400 || error.status === 409)) return error.message;
  return errorText(error);
}

/** Second look is a strength: another employer had no opening, and the skills fit this task. */
export const SECOND_LOOK_LINE = "Another employer had no opening for this proof. The skills match your task.";

/** The proof page's address, from any list. */
export function proofHref(proofId: string): string {
  return `/company/review/${encodeURIComponent(proofId)}`;
}
