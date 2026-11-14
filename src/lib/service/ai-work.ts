import type { AuditEvent } from "@/lib/domain/types";

/** Audit actions for the automated steps the city view counts. */
export const DRAFT_ACTION = "Drafted a Problem Card";
export const DESCRIBE_ACTION = "Described the work";
export const FOLLOW_UP_ACTION = "Asked about the person's own answer";
export const HIDE_ACTION = "Hid identity from the work";

/** Adds up what the audit log records for each kind of automated step. */
export function countAiWork(audit: AuditEvent[]) {
  const count = (action: string) => audit.filter((e) => e.action === action).length;
  const sumOf = (action: string, pattern: RegExp) =>
    audit
      .filter((e) => e.action === action)
      .reduce((sum, e) => sum + Number(pattern.exec(e.detail)?.[1] ?? 0), 0);

  return {
    drafted: count(DRAFT_ACTION),
    described: count(DESCRIBE_ACTION),
    questions: sumOf(FOLLOW_UP_ACTION, /(\d+) question/),
    hidden: sumOf(HIDE_ACTION, /(\d+) detail/),
  };
}
