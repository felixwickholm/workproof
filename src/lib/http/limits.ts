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
} as const;

/** Largest request body any route accepts. A full submission stays under it even when every character is JSON-escaped. */
export const MAX_BODY_BYTES = 128 * 1024;

/** Requests that change data, per caller address and minute. */
export const POSTS_PER_MINUTE = 60;
