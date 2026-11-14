import { appendFileSync } from "node:fs";
import { RESULTS_FILE } from "./summary.setup";

// `never` accepts any typed route context; the call below passes the shape Next passes.
type Handler = (request: Request, ctx: never) => Promise<Response>;
type Invoke = (request: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

/** Calls a route handler the way Next does: a real Request and async params. */
export async function call<T = unknown>(
  handler: Handler,
  options: { body?: unknown; params?: Record<string, string>; method?: string } = {},
): Promise<{ status: number; json: T }> {
  const request = new Request("http://localhost/api", {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: { "content-type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const response = await (handler as unknown as Invoke)(request, { params: Promise.resolve(options.params ?? {}) });
  return { status: response.status, json: (await response.json()) as T };
}

/** Records one row for the summary table printed after the run. */
export function record(evalName: string, check: string, result: string, pass: boolean): void {
  appendFileSync(RESULTS_FILE, `${JSON.stringify({ evalName, check, result, pass })}\n`);
}

/** Every object key anywhere inside a value. */
export function keysDeep(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysDeep);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => [key, ...keysDeep(inner)]);
  }
  return [];
}
