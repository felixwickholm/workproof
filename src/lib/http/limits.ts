/** Text limits shared by the API schemas and the form fields, so the two never disagree. */
export const LIMITS = {
  dreamJob: 200,
  need: 1200,
  approvedBy: 80,
  brief: 1500,
  answer: 8000,
  explain: 1500,
  name: 120,
  contact: 200,
  reviewer: 80,
  feedback: 1000,
  attachmentAlt: 300,
} as const;

/** Largest request body any route accepts. A full submission stays under it even when every character is JSON-escaped. */
export const MAX_BODY_BYTES = 128 * 1024;

/** Largest picture a person may hand in, after decoding. The browser re-encodes photos well below this. */
export const MAX_PICTURE_BYTES = 300 * 1024;

/** The submission route alone also carries one picture as base64 (4 characters per 3 bytes). */
export const MAX_SUBMISSION_BODY_BYTES = MAX_BODY_BYTES + Math.ceil(MAX_PICTURE_BYTES / 3) * 4 + 1024;

/** Requests that change data, per caller address and minute. */
export const POSTS_PER_MINUTE = 60;

/**
 * Story and reset requests, per caller address and minute, counted apart from other changes:
 * the guided walkthrough makes about ten, and each rebuilds a whole event.
 */
export const DEMO_REBUILDS_PER_MINUTE = 30;
