import { describe, expect, it } from "vitest";
import { createBreaker } from "./breaker";
import { aiStatus, resolveProvider } from "./select";

const CLAUDE = { provider: "claude", apiKey: "a-key", model: "claude-opus-5-5" };
const GEMINI = { provider: "gemini", apiKey: "g-key", model: "gemini-3.8-flash" };
const SCRIPTED = { provider: "scripted" };

describe("resolveProvider", () => {
  it.each([
    ["no keys", {}, SCRIPTED],
    ["empty keys", { ANTHROPIC_API_KEY: "", GEMINI_API_KEY: " " }, SCRIPTED],
    ["Anthropic key", { ANTHROPIC_API_KEY: "a-key" }, CLAUDE],
    ["Gemini key", { GEMINI_API_KEY: "g-key" }, GEMINI],
    ["Google key", { GOOGLE_API_KEY: "g-key" }, GEMINI],
    ["Gemini key before Google key", { GEMINI_API_KEY: "g-key", GOOGLE_API_KEY: "other" }, GEMINI],
    ["both keys", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key" }, CLAUDE],
    ["both keys, forced Gemini", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "gemini" }, GEMINI],
    ["both keys, forced Claude", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "claude" }, CLAUDE],
    ["both keys, forced scripted", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "scripted" }, SCRIPTED],
    ["forced Gemini without its key", { ANTHROPIC_API_KEY: "a-key", AI_PROVIDER: "gemini" }, SCRIPTED],
    ["forced Claude without its key", { GEMINI_API_KEY: "g-key", AI_PROVIDER: "claude" }, SCRIPTED],
    ["forced in capitals", { GEMINI_API_KEY: "g-key", AI_PROVIDER: "GEMINI" }, GEMINI],
    ["unknown provider name", { GEMINI_API_KEY: "g-key", AI_PROVIDER: "other" }, GEMINI],
    ["Claude model from env", { ANTHROPIC_API_KEY: "a-key", ANTHROPIC_MODEL: "claude-haiku-5-5" }, { ...CLAUDE, model: "claude-haiku-5-5" }],
    ["Gemini model from env", { GEMINI_API_KEY: "g-key", GEMINI_MODEL: "gemini-3.6-flash" }, { ...GEMINI, model: "gemini-3.6-flash" }],
  ])("%s", (_, env, expected) => {
    expect(resolveProvider(env)).toEqual(expected);
  });
});

describe("aiStatus", () => {
  it("names the provider and model and never the key", () => {
    const status = aiStatus({ ANTHROPIC_API_KEY: "sk-secret-value" }, createBreaker());
    expect(status).toEqual({ provider: "claude", model: "claude-opus-5-5", live: true });
    expect(JSON.stringify(status)).not.toContain("sk-secret");
  });

  it("reports the scripted designer when no key is set", () => {
    expect(aiStatus({}, createBreaker())).toEqual({ provider: "scripted", live: false });
  });
});
