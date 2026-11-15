import { describe, expect, it, vi } from "vitest";
import type { ChallengeDraft } from "@/lib/domain/types";
import { guarded } from "./guarded";
import { createBreaker } from "./provider/breaker";
import { ProviderError } from "./provider/http";
import { scriptedDesigner } from "./scripted";
import type { TaskDesigner } from "./task-designer";

const NEED = "Backend developer for our payments API, error handling and testing";

/** A live designer that fails the way a service with an empty quota does, or answers with the scripted draft. */
function model(name: "gemini" | "claude", fails: boolean): TaskDesigner {
  const fail = () => Promise.reject(new ProviderError(`${name} request failed with status 429`, "quota"));
  return {
    name,
    draftChallenge: (need) => (fails ? fail() : scriptedDesigner.draftChallenge(need)),
    taster: (job) => (fails ? fail() : scriptedDesigner.taster(job)),
    followUps: (c, a) => (fails ? fail() : scriptedDesigner.followUps(c, a)),
  };
}

/** Gemini, then Claude, then the scripted designer, built the way createChain builds it. */
function chain(geminiFails: boolean, claudeFails: boolean): TaskDesigner {
  const last = guarded(scriptedDesigner);
  const claude = guarded(model("claude", claudeFails), { designer: last, breaker: createBreaker(), onFallback: vi.fn() });
  return guarded(model("gemini", geminiFails), { designer: claude, breaker: createBreaker(), onFallback: vi.fn() });
}

describe("designer chain", () => {
  it.each<[string, boolean, boolean, ChallengeDraft["draftedBy"]]>([
    ["Gemini answers", false, false, "gemini"],
    ["Gemini fails, Claude answers", true, false, "claude"],
    ["both fail, the scripted designer answers", true, true, "scripted"],
  ])("%s", async (_, geminiFails, claudeFails, by) => {
    const draft = await chain(geminiFails, claudeFails).draftChallenge(NEED);
    expect(draft.draftedBy).toBe(by);
    expect(draft.coreSkills.length).toBeGreaterThanOrEqual(3);
  });
});

describe("a reply the guard rejects", () => {
  it("is asked for once more, and the second, clean reply is used", async () => {
    let calls = 0;
    const flaky: TaskDesigner = {
      ...model("gemini", false),
      draftChallenge: async (need) => {
        calls += 1;
        const draft = await scriptedDesigner.draftChallenge(need);
        return calls === 1 ? { ...draft, brief: `${draft.brief} The best candidate is young.` } : draft;
      },
    };
    const designer = guarded(flaky, { designer: guarded(scriptedDesigner), breaker: createBreaker(), onFallback: vi.fn() });
    const draft = await designer.draftChallenge(NEED);
    expect(calls).toBe(2);
    expect(draft.draftedBy).toBe("gemini");
  });
});
