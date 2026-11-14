import { beforeEach, describe, expect, it, vi } from "vitest";

/** No request scope by default; a test can turn on a request that carries no sandbox cookie. */
const request = { inScope: false };

vi.mock("next/headers", () => {
  const scope = () => {
    if (!request.inScope) throw new Error("`cookies` was called outside a request scope.");
  };
  return {
    cookies: async () => (scope(), { get: () => undefined }),
    headers: async () => (scope(), new Headers()),
  };
});

const { getSession } = await import("./demo");

beforeEach(() => {
  request.inScope = false;
});

describe("demo session", () => {
  it("gives the persona key to the event's owner: outside a request, the default event's own caller", async () => {
    const session = await getSession();
    expect(session.persona?.talentId).toBeTruthy();
  });

  it("gives no persona key to a request without a sandbox, only the stage", async () => {
    request.inScope = true;
    expect(await getSession()).toEqual({ code: null, persona: null, stage: expect.any(String) });
  });
});
