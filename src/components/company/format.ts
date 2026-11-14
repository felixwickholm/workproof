import { ApiError, errorText } from "@/lib/client/api";

/** Validation messages from the API are written for people; show them. Anything else gets plain words. */
export function companyErrorText(error: unknown): string {
  if (error instanceof ApiError && (error.status === 400 || error.status === 409)) return error.message;
  return errorText(error);
}

/** The proof page's address, from any list. */
export function proofHref(proofId: string): string {
  return `/company/review/${encodeURIComponent(proofId)}`;
}
