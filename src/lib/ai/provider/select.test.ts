import { describe, expect, it } from "vitest";
import { createBreaker } from "./breaker";
import { aiStatus, resolveChain, resolveProvider } from "./select";

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
    ["both keys: Gemini first", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key" }, GEMINI],
    ["both keys, forced Gemini", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "gemini" }, GEMINI],
    ["both keys, forced Claude", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "claude" }, CLAUDE],
    ["both keys, forced scripted", { ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "scripted" }, SCRIPTED],
    ["forced Gemini without its key", { ANTHROPIC_API_KEY: "a-key", AI_PROVIDER: "gemini" }, CLAUDE],
    ["forced Claude without its key", { GEMINI_API_KEY: "g-key", AI_PROVIDER: "claude" }, GEMINI],
    ["forced in capitals", { GEMINI_API_KEY: "g-key", AI_PROVIDER: "GEMINI" }, GEMINI],
    ["unknown provider name", { GEMINI_API_KEY: "g-key", AI_PROVIDER: "other" }, GEMINI],
    ["Claude model from env", { ANTHROPIC_API_KEY: "a-key", ANTHROPIC_MODEL: "claude-haiku-5-5" }, { ...CLAUDE, model: "claude-haiku-5-5" }],
    ["Gemini model from env", { GEMINI_API_KEY: "g-key", GEMINI_MODEL: "gemini-3.6-flash" }, { ...GEMINI, model: "gemini-3.6-flash" }],
  ])("%s", (_, env, expected) => {
    expect(resolveProvider(env)).toEqual(expected);
  });
});

describe("resolveChain", () => {
  it("tries Gemini, then Claude", () => {
    expect(resolveChain({ ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key" })).toEqual([GEMINI, CLAUDE]);
  });

  it("puts the forced model first and keeps the other as a backup", () => {
    expect(resolveChain({ ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "claude" })).toEqual([CLAUDE, GEMINI]);
  });

  it("is empty when the scripted designer is forced", () => {
    expect(resolveChain({ ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key", AI_PROVIDER: "scripted" })).toEqual([]);
  });
});

describe("aiStatus", () => {
  it("reports Claude while Gemini is paused", () => {
    const paused = createBreaker();
    paused.record(Object.assign(new Error("quota"), { name: "ProviderError", kind: "quota" }));
    const status = aiStatus({ ANTHROPIC_API_KEY: "a-key", GEMINI_API_KEY: "g-key" }, (p) => (p === "gemini" ? paused : createBreaker()));
    expect(status).toEqual({ provider: "claude", model: "claude-opus-5-5", live: true });
  });

  it("names the provider and model and never the key", () => {
    const status = aiStatus({ ANTHROPIC_API_KEY: "sk-secret-value" }, () => createBreaker());
    expect(status).toEqual({ provider: "claude", model: "claude-opus-5-5", live: true });
    expect(JSON.stringify(status)).not.toContain("sk-secret");
  });

  it("reports the scripted designer when no key is set", () => {
    expect(aiStatus({}, () => createBreaker())).toEqual({ provider: "scripted", live: false });
  });
});
