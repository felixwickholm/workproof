import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { buildQueue } from "@/lib/service/views";
import { createMemoryStore } from "./memory";

const now = new Date("2026-11-14T12:00:00.000Z");

describe("memory store", () => {
  it("persists changes to the JSON file and reloads them", async () => {
    const file = join(mkdtempSync(join(tmpdir(), "tryout-")), "store.json");
    const store = createMemoryStore(() => buildSeed(now), file);
    await store.update((data) => {
      data.companies[0].blurb = "Changed";
    });
    store.flush();
    expect(JSON.parse(readFileSync(file, "utf8")).companies[0].blurb).toBe("Changed");
    const reloaded = createMemoryStore(() => buildSeed(now), file);
    expect((await reloaded.read()).companies[0].blurb).toBe("Changed");
  });

  it("keeps working in memory when the file cannot be written", async () => {
    const dir = mkdtempSync(join(tmpdir(), "tryout-"));
    writeFileSync(join(dir, "blocker"), "");
    const store = createMemoryStore(() => buildSeed(now), join(dir, "blocker", "store.json"));
    await store.update((data) => {
      data.companies[0].blurb = "Still works";
    });
    expect((await store.read()).companies[0].blurb).toBe("Still works");
  });
});

describe("seed", () => {
  const data = buildSeed(now);

  it("is synthetic Espoo Talent Day with 3 companies, 5 challenges and 10 proofs", () => {
    expect(data.event.name).toBe("Espoo Talent Day");
    expect(data.companies).toHaveLength(3);
    expect(data.challenges).toHaveLength(5);
    expect(data.challenges.some((c) => c.title === "Review an AI-drafted project plan")).toBe(true);
    expect(data.challenges.some((c) => c.companyIds.length > 1)).toBe(true);
    expect(data.proofs).toHaveLength(10);
    expect(new Set(data.decisions.map((d) => `${d.companyId}:${d.reviewer}`)).size).toBe(3);
  });

  it("leaves the demo proof undecided in the first company's queue, not yet in Second look", () => {
    const tuulos = buildQueue(data, "co-tuulos", now);
    const saarnivo = buildQueue(data, "co-saarnivo", now);
    expect(tuulos.proofs.map((p) => p.label)).toContain("Proof K7");
    expect(saarnivo.secondLook.map((p) => p.label)).not.toContain("Proof K7");
    expect(tuulos.secondLook.length).toBeGreaterThan(0);
  });

  it("hides the demo persona's name and school from reviewers", () => {
    const proof = data.proofs.find((p) => p.label === "Proof K7");
    expect(JSON.stringify(proof)).not.toMatch(/Leila|Haddad|Aalto/);
  });

  it("has one invited meeting and feedback owed", () => {
    expect(data.meetings.filter((m) => m.status === "invited")).toHaveLength(1);
    const kivira = buildQueue(data, "co-kivira", now);
    expect(kivira.proofs.length).toBeGreaterThan(0);
  });
});
