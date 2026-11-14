import { describe, expect, it } from "vitest";
import type { Challenge } from "@/lib/domain/types";
import { modelDesignerFor } from "@/lib/ai";
import { checkDraft, checkQuestions } from "@/lib/ai/guarded";
import { resolveProvider } from "@/lib/ai/provider/select";

/**
 * Live calls to every provider with a key, through the real adapters and without the scripted fallback,
 * so a failure shows instead of being hidden. Runs only from `npm run check:ai`, which sets TRYOUT_LIVE_AI.
 */

const NEED = "Backend developer for our booking API: error handling, testing and code review. Works in Finnish with customers.";
const DREAM_JOB = "data analyst";
const ANSWER = "I would add a timeout to the payment call, because a slow provider holds the booking slot. Then a test for a double charge.";

const LIVE_TIMEOUT_MS = 40_000;

const configs = (["claude", "gemini"] as const)
  .map((provider) => resolveProvider({ ...process.env, AI_PROVIDER: provider }))
  .filter((config) => config.provider !== "scripted");

describe.skipIf(process.env.TRYOUT_LIVE_AI !== "1" || configs.length === 0)("live AI", () => {
  describe.each(configs.map((config) => [`${config.provider} ${config.model}`, config] as const))("%s", (_, config) => {
    const designer = modelDesignerFor(config);

    it("draftChallenge", { timeout: LIVE_TIMEOUT_MS }, async () => {
      const draft = await designer.draftChallenge(NEED);
      checkDraft(draft);
      expect(draft.kind).toBe("event");
    });

    it("taster", { timeout: LIVE_TIMEOUT_MS }, async () => {
      const draft = await designer.taster(DREAM_JOB);
      checkDraft(draft);
      expect(draft.kind).toBe("taster");
    });

    it("followUps", { timeout: LIVE_TIMEOUT_MS }, async () => {
      const challenge: Challenge = { ...(await designer.taster(DREAM_JOB)), kind: "event", id: "live", companyIds: ["live"], createdAt: new Date().toISOString() };
      const questions = await designer.followUps(challenge, ANSWER);
      checkQuestions(questions);
      expect(questions).toHaveLength(2);
    });
  });
});
