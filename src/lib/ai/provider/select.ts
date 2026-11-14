/** Which designer drafts tasks, decided once from the environment. Keys are read here and nowhere else. */

export type ProviderName = "scripted" | "claude" | "gemini";

export const DEFAULT_MODELS = { claude: "claude-opus-5-5", gemini: "gemini-3.8-flash" } as const;

export type ProviderConfig =
  | { provider: "scripted" }
  | { provider: "claude" | "gemini"; apiKey: string; model: string };

/** What the UI badge shows. Never carries a key. */
export interface AiStatus {
  provider: ProviderName;
  model?: string;
  live: boolean;
}

type Env = Readonly<Record<string, string | undefined>>;

function read(env: Env, name: string): string | undefined {
  return env[name]?.trim() || undefined;
}

function live(provider: "claude" | "gemini", apiKey: string | undefined, env: Env): ProviderConfig | undefined {
  if (!apiKey) return undefined;
  const model = read(env, provider === "claude" ? "ANTHROPIC_MODEL" : "GEMINI_MODEL") ?? DEFAULT_MODELS[provider];
  return { provider, apiKey, model };
}

/**
 * `AI_PROVIDER` forces one designer; a forced model without its key stays scripted.
 * Otherwise the first key found wins, Claude before Gemini. No key means scripted.
 */
export function resolveProvider(env: Env): ProviderConfig {
  const claude = live("claude", read(env, "ANTHROPIC_API_KEY"), env);
  const gemini = live("gemini", read(env, "GEMINI_API_KEY") ?? read(env, "GOOGLE_API_KEY"), env);
  const scripted: ProviderConfig = { provider: "scripted" };
  switch (read(env, "AI_PROVIDER")?.toLowerCase()) {
    case "scripted":
      return scripted;
    case "claude":
      return claude ?? scripted;
    case "gemini":
      return gemini ?? scripted;
    default:
      return claude ?? gemini ?? scripted;
  }
}

export function statusOf(config: ProviderConfig): AiStatus {
  if (config.provider === "scripted") return { provider: "scripted", live: false };
  return { provider: config.provider, model: config.model, live: true };
}

/** The active designer for the badge and `GET /api/ai/status`. */
export function aiStatus(env: Env = process.env): AiStatus {
  return statusOf(resolveProvider(env));
}
