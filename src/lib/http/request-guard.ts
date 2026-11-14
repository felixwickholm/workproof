import { ServiceError } from "@/lib/service/support";
import { MAX_BODY_BYTES, POSTS_PER_MINUTE } from "./limits";

const WINDOW_MS = 60_000;
const holder = globalThis as typeof globalThis & { __tryoutRate?: Map<string, { start: number; count: number }> };

/** The caller's address as the proxy reports it. Undefined for a local caller. */
function callerAddress(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim();
  if (!forwarded || /^(?:127\.|::1$|::ffff:127\.|localhost$)/.test(forwarded)) return undefined;
  return forwarded;
}

/**
 * A small in-memory limit on requests that change data: POSTS_PER_MINUTE per address.
 * Local callers (the person running the demo, tests and evals) are not limited.
 */
export function limitRate(request: Request, now = Date.now()): void {
  const address = callerAddress(request);
  if (!address) return;
  const counts = (holder.__tryoutRate ??= new Map());
  if (counts.size > 10_000) counts.clear();
  const entry = counts.get(address);
  if (!entry || now - entry.start >= WINDOW_MS) {
    counts.set(address, { start: now, count: 1 });
    return;
  }
  entry.count += 1;
  if (entry.count > POSTS_PER_MINUTE) throw new ServiceError(429, "Too many requests. Wait a minute and try again.");
}

const TOO_LARGE = "The request is too large. Shorten the text and try again.";

/** Reads the body as text and stops at MAX_BODY_BYTES, whatever the content-length header says. */
export async function readLimitedText(request: Request): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) throw new ServiceError(413, TOO_LARGE);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new ServiceError(413, TOO_LARGE);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
