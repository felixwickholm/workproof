import { cookies } from "next/headers";
import { normaliseShareCode, sandboxCookie } from "@/lib/store/cookie";
import { sandboxes } from "@/lib/store";

/** Only a path on this site, so the link cannot send a visitor elsewhere. */
function backTo(to: string | null, request: Request): URL {
  const home = new URL("/", request.url);
  if (!to || !to.startsWith("/") || to.startsWith("//") || to.startsWith("/\\")) return home;
  const target = new URL(to, request.url);
  return target.origin === home.origin ? target : home;
}

/**
 * Joins the sandbox behind a table code (the proxy sends `?table=<code>` here), then goes back to the page.
 * An unknown or expired code changes nothing: the visitor keeps their own sandbox.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = normaliseShareCode(url.searchParams.get("code"));
  const sandbox = code ? sandboxes().byCode(code, Date.now()) : undefined;
  if (sandbox) (await cookies()).set(sandboxCookie(sandbox.id));
  return Response.redirect(backTo(url.searchParams.get("to"), request), 303);
}
