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

const registry = (max = 3) => createSandboxRegistry({ max, lifetimeMs: 12 * HOUR });

describe("sandbox registry", () => {
  it("creates a sandbox on first use and returns the same one after", () => {
    const sandboxes = registry();
    const first = sandboxes.open("sb_a", 0, build);
    expect(sandboxes.open("sb_a", HOUR, build)).toBe(first);
    expect(first.code).toMatch(/^[2-9A-HJ-NP-Z]{6}$/);
    expect(sandboxes.size).toBe(1);
  });

  it("keeps two visitors apart", async () => {
    const sandboxes = registry();
    await sandboxes.open("sb_a", 0, build).store.update((data) => {
      data.event.name = "Changed by A";
    });
    expect((await sandboxes.open("sb_b", 0, build).store.read()).event.name).toBe("Test day");
    expect((await sandboxes.open("sb_a", 0, build).store.read()).event.name).toBe("Changed by A");
  });

  it("drops the least recently used sandbox when full", () => {
    const sandboxes = registry(2);
    const a = sandboxes.open("sb_a", 0, build);
    sandboxes.open("sb_b", 1, build);
    sandboxes.open("sb_a", 2, build);
    sandboxes.open("sb_c", 3, build);
    expect(sandboxes.size).toBe(2);
    expect(sandboxes.open("sb_a", 4, build)).toBe(a);
    expect(sandboxes.byCode(a.code, 4)).toBe(a);
    const b = sandboxes.open("sb_b", 5, build);
    expect(sandboxes.byCode(b.code, 5)).toBe(b);
    expect(sandboxes.size).toBe(2);
  });

  it("replaces a sandbox after 12 hours and retires its code", async () => {
    const sandboxes = registry();
    const old = sandboxes.open("sb_a", 0, build);
    await old.store.update((data) => {
      data.event.name = "Old";
    });
    expect(sandboxes.byCode(old.code, 12 * HOUR)).toBeUndefined();
    const fresh = sandboxes.open("sb_a", 12 * HOUR, build);
    expect(fresh).not.toBe(old);
    expect((await fresh.store.read()).event.name).toBe("Test day");
  });

  it("joins by share code, and an unknown or malformed code joins nothing", () => {
    const sandboxes = registry();
    const a = sandboxes.open("sb_a", 0, build);
    expect(sandboxes.byCode(normaliseShareCode(a.code.toLowerCase()) ?? "", 1)).toBe(a);
    expect(sandboxes.byCode("ZZZZZZ", 1)).toBeUndefined();
    expect(normaliseShareCode("abc")).toBeUndefined();
    expect(normaliseShareCode("O0I1AA")).toBeUndefined();
  });
});
