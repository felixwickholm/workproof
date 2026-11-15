/** One JSON POST to a model API: a 28-second limit per attempt (live drafts take 12 to 20 s) and one retry when the service is busy. */

export const TIMEOUT_MS = 28_000;
const RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 5_000;

/** Why a model API call failed, in one word. Auth and quota failures repeat until someone changes the key or plan. */
export type FailureKind = "auth" | "quota" | "timeout" | "error";

const FAILURE_KINDS: readonly FailureKind[] = ["auth", "quota", "timeout", "error"];

/** A call that never produced a reply worth reading: the service refused it, failed or did not answer in time. */
export class ProviderError extends Error {
  readonly name = "ProviderError";

  constructor(
    message: string,
    readonly kind: FailureKind,
  ) {
    super(message);
  }
}

/**
 * The failure kind of a provider error, or undefined for any other error. Checked by shape, not `instanceof`:
 * each route bundle has its own copy of this module, and the breaker is shared between them.
 */
export function failureOf(error: unknown): FailureKind | undefined {
  if (!(error instanceof Error) || error.name !== "ProviderError") return undefined;
  const kind = (error as { kind?: unknown }).kind;
  return FAILURE_KINDS.find((k) => k === kind);
}

function failureKind(status: number): FailureKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "quota";
  return "error";
}

interface Reply {
  status: number;
  retryAfter: string | null;
  text: string;
}

/** 429 means rate limited; 5xx (529 included) means the service is busy or failing. Both may pass on a second try. */
function retryable(status: number): boolean {
  return status === 429 || status >= 500;
}

/** Honours `retry-after` in seconds, capped so a page never waits long. */
function retryDelay(retryAfter: string | null): number {
  const seconds = Number(retryAfter);
  return seconds > 0 ? Math.min(seconds * 1000, MAX_RETRY_DELAY_MS) : RETRY_DELAY_MS;
}

/** The API's own short error message, for example "invalid x-api-key". Both APIs put it at `error.message`. */
function apiReason(text: string): string {
  try {
    const message = (JSON.parse(text) as { error?: { message?: unknown } }).error?.message;
    return typeof message === "string" && message ? `: ${message.replace(/\s+/g, " ").slice(0, 120)}` : "";
  } catch {
    return "";
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** The time limit covers the whole reply, body included. */
async function attempt(url: string, headers: Record<string, string>, body: string, label: string): Promise<Reply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body, signal: controller.signal });
    return { status: response.status, retryAfter: response.headers.get("retry-after"), text: await response.text() };
  } catch {
    if (controller.signal.aborted) throw new ProviderError(`${label} request timed out after ${TIMEOUT_MS / 1000} s`, "timeout");
    throw new ProviderError(`${label} could not be reached`, "error");
  } finally {
    clearTimeout(timer);
  }
}

/** Errors name the service, the status and the API's short reason. Never the key, the prompt or the answer. */
export async function postJson(url: string, headers: Record<string, string>, payload: unknown, label: string): Promise<unknown> {
  const body = JSON.stringify(payload);
  let reply = await attempt(url, headers, body, label);
  if (retryable(reply.status)) {
    await wait(retryDelay(reply.retryAfter));
    reply = await attempt(url, headers, body, label);
  }
  if (reply.status < 200 || reply.status >= 300) {
    throw new ProviderError(`${label} request failed with status ${reply.status}${apiReason(reply.text)}`, failureKind(reply.status));
  }
  try {
    return JSON.parse(reply.text);
  } catch {
    throw new Error(`${label} sent a reply that is not JSON`);
  }
}
