import { cookies } from "next/headers";
import { isSandboxId, SANDBOX_COOKIE } from "./cookie";

/**
 * The sandbox id of the current request, read from the cookie the proxy sets.
 * Undefined outside a request (unit tests, evals, scripts) and without a valid cookie: those use the default store.
 */
export async function currentSandboxId(): Promise<string | undefined> {
  try {
    const value = (await cookies()).get(SANDBOX_COOKIE)?.value;
    return isSandboxId(value) ? value : undefined;
  } catch (error) {
    if (error instanceof Error && error.message.includes("outside a request scope")) return undefined;
    throw error;
  }
}
