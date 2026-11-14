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
  // Each build gives the persona a new private key, so look it up in the same build.
  const storyProof = (seed: typeof data) =>
    seed.submissions.find((s) => s.talentId === seed.demo.personaTalentId && s.challengeId === "ch-kaari-visits");

  it("is synthetic Espoo Talent Day with 10 employers, 14 live tasks and about 46 proofs", () => {
    expect(data.event.name).toBe("Espoo Talent Day");
    expect(data.companies).toHaveLength(10);
    expect(data.challenges.filter((c) => c.kind === "event" && c.approvedBy)).toHaveLength(14);
    expect(data.challenges.some((c) => c.companyIds.length > 1)).toBe(true);
    expect(data.proofs.length).toBeGreaterThanOrEqual(44);
    expect(new Set(data.decisions.map((d) => `${d.companyId}:${d.reviewer}`)).size).toBeGreaterThanOrEqual(3);
    expect(data.companies.every((c) => c.sector && c.district && c.size && c.workLanguage)).toBe(true);
  });

  it("builds the story around Olena, invited by Kaari Home Care by default", () => {
    expect(data.demo).toMatchObject({ personaName: "Olena Kovalenko", stage: "invited" });
    const invite = data.meetings.find((m) => m.proofId === storyProof(data)?.id && m.companyId === "co-kaari");
    expect(invite?.status).toBe("invited");
  });

  it("puts the story proof undecided in Kaari's queue at the sent stage", () => {
    const sent = buildSeed(now, "sent");
    const kaari = buildQueue(sent, "co-kaari", now);
    expect(kaari.proofs.map((p) => p.proofId)).toContain(storyProof(sent)?.id);
  });

  it("hides the demo persona's name and background from reviewers", () => {
    const proof = data.proofs.find((p) => p.proofId === storyProof(data)?.id);
    expect(proof?.hiddenCount).toBeGreaterThan(0);
    expect(JSON.stringify(proof)).not.toMatch(/Olena|Kovalenko|Kyiv/);
  });

  it("has feedback owed somewhere", () => {
    expect(data.companies.some((c) => buildQueue(data, c.id, now).proofs.length > 0)).toBe(true);
  });
});
