import { cookies, headers } from "next/headers";
import type { HeaderSource } from "@/lib/http/address";
import { isSandboxId, SANDBOX_COOKIE } from "./cookie";

/**
 * Who is asking. `outside`: no request at all (unit tests, evals, scripts). `request`: a page or API request,
 * with the sandbox id from the cookie the proxy sets on page visits, if it carries a valid one.
 */
export type CallerScope = { kind: "outside" } | { kind: "request"; sandboxId: string | undefined; headers: HeaderSource };

const outsideRequest = (error: unknown) => error instanceof Error && error.message.includes("outside a request scope");

export async function callerScope(): Promise<CallerScope> {
  try {
    const [jar, requestHeaders] = await Promise.all([cookies(), headers()]);
    const value = jar.get(SANDBOX_COOKIE)?.value;
    return { kind: "request", sandboxId: isSandboxId(value) ? value : undefined, headers: requestHeaders };
  } catch (error) {
    if (outsideRequest(error)) return { kind: "outside" };
    throw error;
  }
}
