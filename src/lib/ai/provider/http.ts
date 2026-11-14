/** One JSON POST to a model API: a 12-second limit per attempt and one retry when the service is busy. */

export const TIMEOUT_MS = 12_000;
const RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 5_000;

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
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`${label} request timed out after ${TIMEOUT_MS / 1000} s`);
    throw error;
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
  if (reply.status < 200 || reply.status >= 300) throw new Error(`${label} request failed with status ${reply.status}${apiReason(reply.text)}`);
  try {
    return JSON.parse(reply.text);
  } catch {
    throw new Error(`${label} sent a reply that is not JSON`);
  }
}
