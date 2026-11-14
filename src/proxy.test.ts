import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";
import { SANDBOX_COOKIE } from "./lib/store/cookie";

const visit = (path: string, cookie?: string) =>
  proxy(new NextRequest(`http://localhost:3000${path}`, cookie ? { headers: { cookie: `${SANDBOX_COOKIE}=${cookie}` } } : undefined));

describe("proxy", () => {
  it("gives a first page visit a sandbox key", () => {
    expect(visit("/try").cookies.get(SANDBOX_COOKIE)?.value).toMatch(/^sb_/);
  });

  it("never gives an API request a key, so scripts cannot create sandboxes", () => {
    for (const path of ["/api/city", "/api/submissions", "/api/demo/session"]) expect(visit(path).cookies.get(SANDBOX_COOKIE)).toBeUndefined();
  });

  it("keeps an existing key", () => {
    expect(visit("/city", "sb_0f6c2a1e-6d1b-4f6a-9b7e-2c4d8e1a3b5c").cookies.get(SANDBOX_COOKIE)).toBeUndefined();
  });

  it("sends a table code from a page to the join route", () => {
    const response = visit("/try?table=ABC234");
    expect(response.headers.get("location")).toContain("/api/demo/join?code=ABC234");
  });
});
