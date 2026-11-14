import { ServiceError } from "@/lib/service/support";
import { isSandboxId, SANDBOX_COOKIE } from "@/lib/store/cookie";
import { forwardedAddress, isLoopback } from "./address";
import { DEMO_REBUILDS_PER_MINUTE, MAX_BODY_BYTES, POSTS_PER_MINUTE } from "./limits";

const WINDOW_MS = 60_000;
const TOO_MANY = "Too many requests. Wait a minute and try again.";
const holder = globalThis as typeof globalThis & { __workproofRate?: Map<string, { start: number; count: number }> };

/** The caller's address as the proxy reports it. Undefined for a local caller. */
function callerAddress(request: Request): string | undefined {
  const forwarded = forwardedAddress(request.headers);
  return forwarded && !isLoopback(forwarded) ? forwarded : undefined;
}

/** The caller's sandbox id from the request's cookie header. Undefined without a valid sandbox cookie. */
export function callerSandbox(request: Request): string | undefined {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const value = cookies.map((c) => c.trim()).find((c) => c.startsWith(`${SANDBOX_COOKIE}=`))?.slice(SANDBOX_COOKIE.length + 1);
  return isSandboxId(value) ? value : undefined;
}

/**
 * Every key the caller is counted under: its address when a proxy reports one, and its sandbox, so each
 * visitor's event is limited even behind a proxy that hides addresses or gives many visitors one address.
 */
function callerKeys(request: Request): string[] {
  const address = callerAddress(request);
  const sandbox = callerSandbox(request);
  return [...(address ? [`address:${address}`] : []), ...(sandbox ? [`sandbox:${sandbox}`] : [])];
}

/** A separate count per address and bucket, so one kind of request never uses up another's allowance. */
export interface RateBucket {
  name: string;
  perMinute: number;
}

/** Adds one to the key's count in the current minute and returns the new count. */
function count(counts: Map<string, { start: number; count: number }>, key: string, now: number): number {
  const entry = counts.get(key);
  if (!entry || now - entry.start >= WINDOW_MS) {
    counts.set(key, { start: now, count: 1 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

const CHANGES: RateBucket = { name: "changes", perMinute: POSTS_PER_MINUTE };
const DEMO_REBUILDS: RateBucket = { name: "demo", perMinute: DEMO_REBUILDS_PER_MINUTE };

/**
 * A small in-memory limit on requests that change data: `bucket.perMinute` per address and per sandbox,
 * each counted on its own. Local callers without a sandbox (tests, evals, scripts) are not limited.
 */
export function limitRate(request: Request, now = Date.now(), bucket: RateBucket = CHANGES): void {
  const keys = callerKeys(request);
  if (keys.length === 0) return;
  const counts = (holder.__workproofRate ??= new Map());
  if (counts.size > 10_000) counts.clear();
  let over = false;
  for (const caller of keys) if (count(counts, `${bucket.name}:${caller}`, now) > bucket.perMinute) over = true;
  if (over) throw new ServiceError(429, TOO_MANY);
}

/**
 * One count shared by every caller, whatever address or cookie they send: the ceiling for routes that
 * spend money per call, so neither a missing address nor many cookies get around it.
 */
export function limitAllCallers(bucket: RateBucket, now = Date.now()): void {
  const counts = (holder.__workproofRate ??= new Map());
  if (count(counts, `${bucket.name}:all`, now) > bucket.perMinute) throw new ServiceError(429, TOO_MANY);
}

/** Story and reset requests have their own count, so a walkthrough never runs into the limit for other changes. */
export function limitDemoRebuilds(request: Request, now = Date.now()): void {
  limitRate(request, now, DEMO_REBUILDS);
}

const TOO_LARGE = "The request is too large. Shorten the text and try again.";

/** Reads the body as text and stops at `maxBytes`, whatever the content-length header says. */
export async function readLimitedText(request: Request, maxBytes = MAX_BODY_BYTES): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new ServiceError(413, TOO_LARGE);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new ServiceError(413, TOO_LARGE);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
