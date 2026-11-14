import { beforeEach, describe, expect, it, vi } from "vitest";

/** What next/headers sees for the current test: no request at all, or a request with these cookies and headers. */
const request: { inScope: boolean; cookie?: string; headers: Record<string, string> } = { inScope: false, headers: {} };

vi.mock("next/headers", () => {
  const outside = () => {
    throw new Error("`cookies` was called outside a request scope.");
  };
  return {
    cookies: async () => {
      if (!request.inScope) outside();
      return { get: (name: string) => (name === "workproof_sandbox" && request.cookie ? { name, value: request.cookie } : undefined) };
    },
    headers: async () => {
      if (!request.inScope) outside();
      return new Headers(request.headers);
    },
  };
});

// A tiny event, so these tests check scoping only and not the seed.
vi.mock("@/lib/seed", () => ({
  buildSeed: () => ({
    version: 1,
    event: { name: "Shared day", date: "2026-11-14", responseWindowHours: 48 },
    companies: [],
    challenges: [],
    talents: [],
    submissions: [],
    proofs: [],
    decisions: [],
    meetings: [],
    audit: [],
    demo: { personaTalentId: "t_persona", personaName: "Test Person", stage: "invited" },
  }),
}));

const { assertWritable, currentSandbox, getStore, NO_SANDBOX_MESSAGE, ownsEvent, sandboxes } = await import("./index");
const { SANDBOXES_PER_ADDRESS } = await import("./creation-limit");

const sandboxId = (n: number) => `sb_00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const rename = (name: string) => getStore().update((data) => {
  data.event.name = name;
});

beforeEach(() => {
  request.inScope = false;
  request.cookie = undefined;
  request.headers = {};
});

describe("store scope", () => {
  it("outside a request (tests, evals, scripts) uses the default store and may change it", async () => {
    await rename("Changed by an eval");
    expect((await getStore().read()).event.name).toBe("Changed by an eval");
    expect(await currentSandbox()).toBeUndefined();
  });

  it("a request without a sandbox cookie reads the shared event but cannot change it or create a sandbox", async () => {
    request.inScope = true;
    const before = sandboxes().size;
    expect((await getStore().read()).event.name).toBeTruthy();
    await expect(rename("Changed by a script")).rejects.toMatchObject({ status: 401, message: NO_SANDBOX_MESSAGE });
    await expect(getStore().replace(await getStore().read())).rejects.toMatchObject({ status: 401 });
    expect(sandboxes().size).toBe(before);
    expect(await ownsEvent()).toBe(false);
    await expect(assertWritable()).rejects.toMatchObject({ status: 401, message: NO_SANDBOX_MESSAGE });
  });

  it("says up front who may change the event: no request, or a request with its own sandbox", async () => {
    expect(await ownsEvent()).toBe(true);
    request.inScope = true;
    request.cookie = sandboxId(2);
    request.headers = { "x-forwarded-for": "203.0.113.9" };
    expect(await ownsEvent()).toBe(true);
    await expect(assertWritable()).resolves.toBeUndefined();
  });

  it("a request with a sandbox cookie gets its own event, created once", async () => {
    request.inScope = true;
    request.cookie = sandboxId(1);
    request.headers = { "x-forwarded-for": "203.0.113.1" };
    await rename("Mine");
    expect((await getStore().read()).event.name).toBe("Mine");
    expect((await currentSandbox())?.id).toBe(sandboxId(1));
    request.cookie = undefined;
    expect((await getStore().read()).event.name).not.toBe("Mine");
  });

  it("limits new sandboxes per address and serves the rest the read-only shared event", async () => {
    request.inScope = true;
    request.headers = { "x-forwarded-for": "203.0.113.2" };
    for (let i = 0; i < SANDBOXES_PER_ADDRESS; i++) {
      request.cookie = sandboxId(100 + i);
      expect(await currentSandbox()).toBeDefined();
    }
    request.cookie = sandboxId(200);
    expect(await currentSandbox()).toBeUndefined();
    await expect(rename("Over the limit")).rejects.toMatchObject({ status: 401 });
    // Sandboxes made before the limit keep working.
    request.cookie = sandboxId(100);
    await expect(rename("Still mine")).resolves.toBeUndefined();
    request.headers = { "x-forwarded-for": "203.0.113.3" };
    request.cookie = sandboxId(201);
    expect(await currentSandbox()).toBeDefined();
  });

  it("counts callers without any address under one shared key", async () => {
    request.inScope = true;
    for (let i = 0; i < SANDBOXES_PER_ADDRESS; i++) {
      request.cookie = sandboxId(300 + i);
      expect(await currentSandbox()).toBeDefined();
    }
    request.cookie = sandboxId(400);
    expect(await currentSandbox()).toBeUndefined();
  });
});
