import { forwardedAddress, isLoopback, type HeaderSource } from "@/lib/http/address";

/** New sandboxes one address may start within the window. */
export const SANDBOXES_PER_ADDRESS = 20;
export const SANDBOX_WINDOW_MS = 10 * 60 * 1000;

/** Counts events per key in fixed windows. */
export interface WindowLimiter {
  /** Counts one event for `key` and says whether it is within the limit. An undefined key is never limited. */
  allow(key: string | undefined, now: number): boolean;
}

export function createWindowLimiter(options: { max: number; windowMs: number }): WindowLimiter {
  const counts = new Map<string, { start: number; count: number }>();
  return {
    allow(key, now) {
      if (key === undefined) return true;
      if (counts.size > 10_000) {
        for (const [k, entry] of counts) if (now - entry.start >= options.windowMs) counts.delete(k);
      }
      const entry = counts.get(key);
      if (!entry || now - entry.start >= options.windowMs) {
        counts.set(key, { start: now, count: 1 });
        return true;
      }
      entry.count += 1;
      return entry.count <= options.max;
    },
  };
}

/**
 * The key a new sandbox is counted under: the caller's address, or one shared key when no address is
 * reported, so a server reached without a proxy is still limited. Outside production a loopback caller
 * (the developer, the e2e harness opening many browsers) is not counted.
 */
export function creationKey(headers: HeaderSource, production: boolean): string | undefined {
  const address = forwardedAddress(headers);
  if (!address) return "unknown";
  if (!production && isLoopback(address)) return undefined;
  return address;
}
