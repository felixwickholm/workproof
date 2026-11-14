/** Anything with a header lookup: a Request's headers or Next's read-only request headers. */
export interface HeaderSource {
  get(name: string): string | null;
}

const LOOPBACK = /^(?:127\.|::1$|::ffff:127\.|localhost$)/;

/** The caller's address as the hosting proxy reports it: the first forwarded address, else x-real-ip. */
export function forwardedAddress(headers: HeaderSource): string | undefined {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || undefined;
}

/** A caller on this machine: the developer, a test or the e2e harness. */
export function isLoopback(address: string): boolean {
  return LOOPBACK.test(address);
}
