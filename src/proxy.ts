import { NextResponse, type NextRequest } from "next/server";
import { isSandboxId, newSandboxId, SANDBOX_COOKIE, sandboxCookie } from "@/lib/store/cookie";

const JOIN_PATH = "/api/demo/join";

/**
 * Gives every visitor a private sandbox key on a page visit, and hands `?table=<code>` to the join route.
 * API requests never get a key here: a script calling the API without visiting the site reads the shared
 * event and cannot fill the registry with sandboxes. The proxy holds no state: sandboxes live with the
 * route handlers, so joining by code happens there.
 */
export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const table = nextUrl.searchParams.get("table");
  if (table !== null && !nextUrl.pathname.startsWith("/api/")) {
    const back = nextUrl.clone();
    back.searchParams.delete("table");
    const join = new URL(JOIN_PATH, request.url);
    join.searchParams.set("code", table);
    join.searchParams.set("to", `${back.pathname}${back.search}`);
    return NextResponse.redirect(join);
  }

  if (nextUrl.pathname.startsWith("/api/") || isSandboxId(request.cookies.get(SANDBOX_COOKIE)?.value)) return NextResponse.next();

  // First visit: the route handling this very request already sees the new key.
  const id = newSandboxId();
  const headers = new Headers(request.headers);
  const others = (headers.get("cookie") ?? "").split(";").map((part) => part.trim()).filter((part) => part && !part.startsWith(`${SANDBOX_COOKIE}=`));
  headers.set("cookie", [...others, `${SANDBOX_COOKIE}=${id}`].join("; "));
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(sandboxCookie(id));
  return response;
}

export const config = {
  // Pages and API routes; not build files or files in public/ (anything with an extension).
  matcher: ["/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)"],
};
