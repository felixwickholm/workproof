import type { AuditEvent } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { newId } from "@/lib/util/hash";

/** An expected failure with an HTTP status. Route handlers turn it into `{ error }`. */
export class ServiceError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

/** Replaceable clock, so tests can move time forward. */
export const clock = { now: (): Date => new Date() };

export function appendAudit(
  data: StoreData,
  event: Omit<AuditEvent, "id" | "at"> & { at?: string },
): AuditEvent {
  const entry: AuditEvent = {
    id: newId("audit"),
    at: event.at ?? clock.now().toISOString(),
    actor: event.actor,
    by: event.by,
    action: event.action,
    detail: event.detail,
  };
  data.audit.push(entry);
  return entry;
}

export function findOrThrow<T>(items: T[], match: (item: T) => boolean, what: string): T {
  const found = items.find(match);
  if (!found) throw new ServiceError(404, `${what} not found`);
  return found;
}

export function byArrival<T extends { submittedAt: string }>(a: T, b: T): number {
  return a.submittedAt.localeCompare(b.submittedAt);
}
