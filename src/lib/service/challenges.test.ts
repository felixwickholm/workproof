import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scriptedDesigner } from "@/lib/ai/scripted";
import type { TaskDesigner } from "@/lib/ai/task-designer";
import { buildSeed } from "@/lib/seed";
import { SAMPLE_ADS } from "@/lib/seed/ads";
import { approveRequest } from "@/lib/http/schemas";
import { getStore } from "@/lib/store";

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

/** Counts every designer call, so a test can show a refused request never reached it. */
const calls = vi.fn();
vi.mock("@/lib/ai", () => {
  const counted: TaskDesigner = {
    name: "scripted",
    draftChallenge: (need) => (calls("draftChallenge"), scriptedDesigner.draftChallenge(need)),
    taster: (dreamJob) => (calls("taster"), scriptedDesigner.taster(dreamJob)),
    followUps: (challenge, answer) => (calls("followUps"), scriptedDesigner.followUps(challenge, answer)),
  };
  return { getTaskDesigner: () => counted };
});

const { approveChallenge, claimChallenge, createTaster, draftChallenge, draftFromAd, publishOnBehalf, readyMessage, readyMessageFor } = await import("./challenges");
const { buildEmployerHome } = await import("./views/employer");

const NEED = "Backend developer for our payments API: API design, error handling, security, testing";

beforeEach(async () => {
  request.inScope = false;
  calls.mockClear();
  await getStore().replace(buildSeed(new Date("2026-11-14T12:00:00Z")));
});

describe("a request the store would refuse never reaches the designer", () => {
  it("refuses a draft and a practice task from a request without a sandbox before drafting", async () => {
    request.inScope = true;
    await expect(draftChallenge(NEED)).rejects.toMatchObject({ status: 401 });
    await expect(createTaster("nurse")).rejects.toMatchObject({ status: 401 });
    expect(calls).not.toHaveBeenCalled();
  });
});

describe("the task template id", () => {
  it("is kept through publishing, so follow-ups never depend on the editable title", async () => {
    const draft = await draftChallenge(NEED);
    expect(draft.templateId).toBe("backend");
    const published = await approveChallenge({ draft: { ...draft, title: "Our payments review" }, companyId: "co-kivira", approvedBy: "Laura Niemi" });
    expect(published.templateId).toBe("backend");
  });

  it("drops an id the designer never sets", async () => {
    const draft = await draftChallenge(NEED);
    const published = await approveChallenge({ draft: { ...draft, templateId: "made-up" }, companyId: "co-kivira", approvedBy: "Laura Niemi" });
    expect(published.templateId).toBeUndefined();
  });
});

describe("the roles a company picks", () => {
  it("pass the request schema and are kept on the published challenge, so the right job seekers see it first", async () => {
    const draft = await draftChallenge(NEED);
    const body = approveRequest.parse({ draft: { ...draft, roles: ["software-engineer"] }, companyId: "co-kivira", approvedBy: "Laura Niemi" });
    const published = await approveChallenge(body);
    expect(published.roles).toEqual(["software-engineer"]);
  });

  it("refuses a role that is not on the shared list", () => {
    expect(approveRequest.safeParse({ draft: { roles: ["astronaut"] }, companyId: "co-kivira", approvedBy: "A" }).success).toBe(false);
  });
});

describe("a challenge from a job-ad link, published by the city", () => {
  const AD = "<title>Backend developer</title><h1>Backend developer for our payments API</h1><ul><li>API design</li><li>Error handling and testing</li><li>Contact mikko@example.org</li></ul>";
  const deps = {
    resolve: async () => ["93.184.216.34"],
    fetch: async () => new Response(AD, { headers: { "content-type": "text/html" } }),
  };

  it("drafts from the ad's words and keeps the link for the city", async () => {
    const draft = await draftFromAd("https://jobs.example.org/backend", undefined, deps);
    expect(calls).toHaveBeenCalledWith("draftChallenge");
    expect(draft.adUrl).toBe("https://jobs.example.org/backend");
    expect(draft.coreSkills.map((s) => s.id)).toEqual(expect.arrayContaining(["api-design", "error-handling"]));
  });

  it("publishes on the company's behalf, lists it as unclaimed until the company opens it, and writes the ready message", async () => {
    const draft = await draftFromAd("https://jobs.example.org/backend", undefined, deps);
    const { challenge, message } = await publishOnBehalf({ companyId: "co-kivira", draft, by: "Maija Kaupunki" }, (id) => `https://example.org/employer/challenges/${id}`);
    expect(challenge).toMatchObject({ onBehalf: { by: "Maija Kaupunki", adUrl: "https://jobs.example.org/backend" }, approvedBy: "Maija Kaupunki" });
    expect(message).toBe(`We made a challenge for you: ${challenge.title}. It is live for job seekers now. See it here: https://example.org/employer/challenges/${challenge.id}`);
    const home = () => getStore().read().then((data) => buildEmployerHome(data, "co-kivira", new Date()));
    expect((await home()).unclaimed.map((u) => u.challenge.id)).toEqual([challenge.id]);
    await expect(claimChallenge(challenge.id, "co-halla")).rejects.toMatchObject({ status: 403 });
    expect((await claimChallenge(challenge.id, "co-kivira")).claimedAt).toBeTruthy();
    expect((await home()).unclaimed).toEqual([]);
    expect(await readyMessageFor(challenge.id, "L")).toMatch(/It is live for job seekers now/);
  });

  /**
   * The library role and the core skills each sample ad is drafted with. A skill the ad asks for outright stays
   * even outside the role ("Explain results to the warehouse team"); a loose word never adds one.
   */
  const SAMPLE_DRAFTS: Record<string, { role: string; skills: string[] }> = {
    "kide-chip-verification-engineer": { role: "chip-verification-engineer", skills: ["timing-analysis", "digital-design", "prioritisation", "technical-explanation"] },
    "halla-ai-developer": { role: "automation-developer", skills: ["ai-assisted-work", "automation-choice", "practical-plan", "risk-sense"] },
    "saarnivo-financial-analyst": { role: "business-analyst", skills: ["bookkeeping-accuracy", "stakeholder-communication", "budget-analysis"] },
    "revontuli-marketing-specialist": { role: "marketing", skills: ["audience-insight", "campaign-analysis", "experiment-design", "writing-clarity"] },
    "tuulos-software-engineer": { role: "ml-engineer", skills: ["ml-evaluation", "testing", "code-review", "technical-explanation"] },
  };

  it.each(SAMPLE_ADS.map((ad) => [ad.slug] as const))("drafts the sample ad %s for its role, with no heading as a wish", async (slug) => {
    const html = readFileSync(new URL(`../http/fixtures/ads/${slug}.html`, import.meta.url), "utf8");
    const sampleDeps = { resolve: async () => ["93.184.216.34"], fetch: async () => new Response(html, { headers: { "content-type": "text/html" } }) };
    const draft = await draftFromAd(`https://jobs.example.org/${slug}`, undefined, sampleDeps);
    expect(draft.templateId).toBe(SAMPLE_DRAFTS[slug].role);
    expect(draft.coreSkills.map((s) => s.id)).toEqual(SAMPLE_DRAFTS[slug].skills);
    const wishes = (draft.wishes ?? []).map((w) => w.text);
    for (const heading of ["What you will do", "What we look for", "Sample job ad"]) {
      expect(draft.yourWords).not.toContain(heading);
      expect(wishes.join("\n")).not.toContain(heading);
    }
    expect(draft.facts?.some((fact) => fact.startsWith("Work language:"))).toBe(true);
  });

  it("says one person or many in the ready message", () => {
    expect(readyMessage("Fix one wrong number", 1, "L")).toBe("We made a challenge for you: Fix one wrong number. 1 person already did it. See how they did: L");
    expect(readyMessage("Which path fails in this timing report?", 2, "L")).toBe("We made a challenge for you: Which path fails in this timing report? 2 people already did it. See how they did: L");
    expect(readyMessage("Fix one wrong number", 20, "L")).toBe("We made a challenge for you: Fix one wrong number. 20 people already did it. See how they did: L");
  });
});
