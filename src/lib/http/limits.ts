/** Text limits shared by the API schemas and the form fields, so the two never disagree. */
export const LIMITS = {
  dreamJob: 200,
  need: 2000,
  approvedBy: 80,
  brief: 1500,
  answer: 12000,
  explain: 4000,
  name: 120,
  contact: 200,
  reviewer: 80,
  feedback: 2000,
} as const;
