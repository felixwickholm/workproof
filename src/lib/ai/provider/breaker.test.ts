import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDesigner } from "../index";
import { createBreaker, PAUSE_MS, providerBreaker } from "./breaker";
import { ProviderError } from "./http";
import { statusOf, type ProviderConfig } from "./select";

const NEED = "Backend developer for our payments API, error handling and testing";
const GEMINI: ProviderConfig = { provider: "gemini", apiKey: "test-gemini-key", model: "gemini-3.8-flash" };

const TASK = {
  title: "Review the payment retry change",
  format: "review",
  proofKind: "code",
  brief: "A teammate wrote this change. It retries card payments when the provider is slow. Read it before it ships.",
  material: { kind: "code", title: "charge.ts", body: "for (;;) { const res = await fetch(PAY_URL); if (res.ok) return res.json(); }" },
  deliverable: "A short note: what would you change before this ships, and why?",
  coreSkills: [
    { id: "code-review", why: "Changes start as drafts and need a careful read." },
    { id: "error-handling", why: "Payments fail at the edges, so retries matter." },
    { id: "testing", why: "Tests show the change is safe without asking the author." },
  ],
  reviewGuide: [{ skillId: "code-review", lookFor: "Points to specific lines and says what would break." }],
  setAside: [],
};

const fetchMock = vi.fn<typeof fetch>();

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const modelReply = () => respond({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(TASK) }] } }] });

/** A designer whose breaker reads a clock the test moves by hand. */
function setup() {
  let time = Date.parse("2026-11-14T10:00:00.000Z");
  const breaker = createBreaker(() => time);
  const onFallback = vi.fn();
  return {
    breaker,
    onFallback,
    designer: createDesigner(GEMINI, onFallback, breaker),
    advance: (ms: number) => {
      time += ms;
    },
  };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("provider breaker", () => {
  it("opens after an auth failure and reports the pause without the provider's message", async () => {
    fetchMock.mockResolvedValueOnce(respond({ error: { message: "API key test-gemini-key not valid" } }, 401));
    const { designer, breaker } = setup();
    expect((await designer.draftChallenge(NEED)).draftedBy).toBe("scripted");

    const status = statusOf(GEMINI, breaker);
    expect(status).toEqual({ provider: "gemini", model: "gemini-3.8-flash", live: false, pausedUntil: "2026-11-14T10:05:00.000Z", pauseReason: "auth" });
    expect(JSON.stringify(status)).not.toMatch(/test-gemini-key|not valid/);
  });

  it("skips the model while open and logs only the first failure", async () => {
    fetchMock.mockResolvedValueOnce(respond({ error: { message: "quota exceeded" } }, 403));
    const { designer, onFallback } = setup();
    await designer.draftChallenge(NEED);
    const second = await designer.draftChallenge(NEED);
    const taster = await designer.taster("backend developer");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(onFallback).toHaveBeenCalledOnce();
    expect(second.draftedBy).toBe("scripted");
    expect(taster.draftedBy).toBe("scripted");
  });

  it("closes after five minutes and tries the model again", async () => {
    fetchMock.mockResolvedValueOnce(respond({}, 401)).mockResolvedValueOnce(modelReply());
    const { designer, breaker, advance } = setup();
    await designer.draftChallenge(NEED);

    advance(PAUSE_MS - 1);
    expect(breaker.pause()).toBeDefined();
    advance(1);
    expect(breaker.pause()).toBeUndefined();
    expect((await designer.draftChallenge(NEED)).draftedBy).toBe("gemini");
    expect(statusOf(GEMINI, breaker)).toMatchObject({ live: true });
  });

  it("stays closed after a success", async () => {
    fetchMock.mockImplementation(async () => modelReply());
    const { designer, breaker } = setup();
    await designer.draftChallenge(NEED);
    expect(breaker.pause()).toBeUndefined();
    expect((await designer.draftChallenge(NEED)).draftedBy).toBe("gemini");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("stays closed when the model answered but the guard rejected the reply", async () => {
    fetchMock.mockResolvedValueOnce(respond({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "{not json" }] } }] }));
    const { designer, breaker } = setup();
    expect((await designer.draftChallenge(NEED)).draftedBy).toBe("scripted");
    expect(breaker.pause()).toBeUndefined();
  });

  it.each([
    [new ProviderError("Gemini request failed with status 429", "quota"), "quota"],
    [new ProviderError("Gemini request timed out after 12 s", "timeout"), "timeout"],
    [new ProviderError("Gemini request failed with status 503", "error"), "error"],
  ] as const)("names the reason for %s", (error, reason) => {
    const breaker = createBreaker(() => 0);
    expect(breaker.record(error)).toBe(true);
    expect(breaker.pause()).toEqual({ until: new Date(PAUSE_MS).toISOString(), reason });
  });

  it("counts a provider failure thrown by another route bundle's copy of the module", () => {
    const breaker = createBreaker(() => 0);
    expect(breaker.record(Object.assign(new Error("Gemini request failed with status 429"), { name: "ProviderError", kind: "quota" }))).toBe(true);
    expect(breaker.pause()?.reason).toBe("quota");
    expect(createBreaker().record(new Error("Gemini sent a reply that is not JSON"))).toBe(false);
  });

  it("shares one pause across the whole process", () => {
    providerBreaker().record(new ProviderError("Gemini request timed out after 12 s", "timeout"));
    expect(providerBreaker().pause()?.reason).toBe("timeout");
    delete (globalThis as { __workprintProviderPause?: unknown }).__workprintProviderPause;
  });
});
