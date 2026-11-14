import { describe, expect, it } from "vitest";
import { normaliseShareCode } from "./cookie";
import { createSandboxRegistry } from "./sandbox";
import type { StoreData } from "./types";

const HOUR = 3_600_000;

/** A tiny event; the registry never looks inside it. */
function build(): StoreData {
  return {
    version: 1,
    event: { name: "Test day", date: "2026-11-14", responseWindowHours: 48 },
    companies: [],
    challenges: [],
    talents: [],
    submissions: [],
    proofs: [],
    decisions: [],
    meetings: [],
    audit: [],
    demo: { personaTalentId: "t_persona", personaName: "Test Person", stage: "invited" },
  };
}

const MINUTE = 60_000;
const registry = (max = 3) => createSandboxRegistry({ max, lifetimeMs: 12 * HOUR, protectedMs: 30 * MINUTE });

describe("sandbox registry", () => {
  it("creates a sandbox only when asked, and finds the same one after", () => {
    const sandboxes = registry();
    expect(sandboxes.find("sb_a", 0)).toBeUndefined();
    const first = sandboxes.create("sb_a", 0, build);
    expect(sandboxes.find("sb_a", HOUR)).toBe(first);
    expect(first?.code).toMatch(/^[2-9A-HJ-NP-Z]{6}$/);
    expect(sandboxes.size).toBe(1);
  });

  it("keeps two visitors apart", async () => {
    const sandboxes = registry();
    await sandboxes.create("sb_a", 0, build)?.store.update((data) => {
      data.event.name = "Changed by A";
    });
    expect((await sandboxes.create("sb_b", 0, build)?.store.read())?.event.name).toBe("Test day");
    expect((await sandboxes.find("sb_a", 0)?.store.read())?.event.name).toBe("Changed by A");
  });

  it("drops the least recently used sandbox when full and it was idle for 30 minutes", () => {
    const sandboxes = registry(2);
    const a = sandboxes.create("sb_a", 0, build);
    sandboxes.create("sb_b", 1, build);
    sandboxes.find("sb_a", 2);
    const c = sandboxes.create("sb_c", 30 * MINUTE + 1, build);
    expect(c).toBeDefined();
    expect(sandboxes.size).toBe(2);
    expect(sandboxes.find("sb_b", 30 * MINUTE + 2)).toBeUndefined();
    expect(sandboxes.find("sb_a", 30 * MINUTE + 2)).toBe(a);
    expect(a && sandboxes.byCode(a.code, 30 * MINUTE + 2)).toBe(a);
  });

  it("never evicts a sandbox used in the last 30 minutes: a newcomer is refused instead", () => {
    const sandboxes = registry(2);
    sandboxes.create("sb_a", 0, build);
    sandboxes.create("sb_b", 0, build);
    expect(sandboxes.create("sb_c", 29 * MINUTE, build)).toBeUndefined();
    expect(sandboxes.find("sb_a", 29 * MINUTE)).toBeDefined();
    expect(sandboxes.find("sb_b", 29 * MINUTE)).toBeDefined();
    expect(sandboxes.size).toBe(2);
  });

  it("counts use, not creation: a busy old sandbox outlives an idle newer one", () => {
    const sandboxes = registry(2);
    sandboxes.create("sb_old", 0, build);
    sandboxes.create("sb_new", 10 * MINUTE, build);
    sandboxes.find("sb_old", 50 * MINUTE);
    expect(sandboxes.create("sb_c", 50 * MINUTE, build)).toBeDefined();
    expect(sandboxes.find("sb_old", 50 * MINUTE)).toBeDefined();
    expect(sandboxes.find("sb_new", 50 * MINUTE)).toBeUndefined();
  });

  it("evicts at a cap of 2000 without slowing down", () => {
    const sandboxes = registry(2000);
    for (let i = 0; i < 2000; i++) sandboxes.create(`sb_${i}`, 0, build);
    expect(sandboxes.create("sb_late", 10 * MINUTE, build)).toBeUndefined();
    expect(sandboxes.create("sb_later", HOUR, build)).toBeDefined();
    expect(sandboxes.size).toBe(2000);
    expect(sandboxes.find("sb_0", HOUR)).toBeUndefined();
  });

  it("replaces a sandbox after 12 hours and retires its code", async () => {
    const sandboxes = registry();
    const old = sandboxes.create("sb_a", 0, build);
    await old?.store.update((data) => {
      data.event.name = "Old";
    });
    expect(old && sandboxes.byCode(old.code, 12 * HOUR)).toBeUndefined();
    expect(sandboxes.find("sb_a", 12 * HOUR)).toBeUndefined();
    const fresh = sandboxes.create("sb_a", 12 * HOUR, build);
    expect(fresh).not.toBe(old);
    expect((await fresh?.store.read())?.event.name).toBe("Test day");
  });

  it("joins by share code, and an unknown or malformed code joins nothing", () => {
    const sandboxes = registry();
    const a = sandboxes.create("sb_a", 0, build);
    expect(sandboxes.byCode(normaliseShareCode(a?.code.toLowerCase()) ?? "", 1)).toBe(a);
    expect(sandboxes.byCode("ZZZZZZ", 1)).toBeUndefined();
    expect(normaliseShareCode("abc")).toBeUndefined();
    expect(normaliseShareCode("O0I1AA")).toBeUndefined();
  });
});
