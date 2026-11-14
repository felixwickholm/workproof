/** Which designer drafts tasks, decided once from the environment. Keys are read here and nowhere else. */

import type { DraftedBy } from "@/lib/domain/types";
import { providerBreaker, type Breaker } from "./breaker";
import type { FailureKind } from "./http";

export type ProviderName = DraftedBy;

const DEFAULT_MODELS = { claude: "claude-opus-5-5", gemini: "gemini-3.8-flash" } as const;

export type LiveConfig = { provider: "claude" | "gemini"; apiKey: string; model: string };
export type ProviderConfig = { provider: "scripted" } | LiveConfig;

/** What the UI badge shows. Never carries a key or a provider's own error message. */
export interface AiStatus {
  /** The configured designer, also while it is paused. */
  provider: ProviderName;
  model?: string;
  /** True when drafts come from the configured model right now. */
  live: boolean;
  /** ISO time the paused model is tried again. */
  pausedUntil?: string;
  pauseReason?: FailureKind;
}

type Env = Readonly<Record<string, string | undefined>>;

function read(env: Env, name: string): string | undefined {
  return env[name]?.trim() || undefined;
}

function live(provider: "claude" | "gemini", apiKey: string | undefined, env: Env): LiveConfig | undefined {
  if (!apiKey) return undefined;
  const model = read(env, provider === "claude" ? "ANTHROPIC_MODEL" : "GEMINI_MODEL") ?? DEFAULT_MODELS[provider];
  return { provider, apiKey, model };
}

/**
 * The live models in the order they are tried; the scripted designer always answers after the last one.
 * Gemini comes first, then Claude. `AI_PROVIDER` puts its model first, or "scripted" turns the live models off.
 */
export function resolveChain(env: Env): LiveConfig[] {
  const claude = live("claude", read(env, "ANTHROPIC_API_KEY"), env);
  const gemini = live("gemini", read(env, "GEMINI_API_KEY") ?? read(env, "GOOGLE_API_KEY"), env);
  const forced = read(env, "AI_PROVIDER")?.toLowerCase();
  if (forced === "scripted") return [];
  const order = forced === "claude" ? [claude, gemini] : [gemini, claude];
  return order.filter((c): c is LiveConfig => c !== undefined);
}

/** The first designer of the chain: the model that drafts when it answers. */
export function resolveProvider(env: Env): ProviderConfig {
  return resolveChain(env)[0] ?? { provider: "scripted" };
}

export function statusOf(config: ProviderConfig, breaker: Breaker = providerBreaker(config.provider)): AiStatus {
  if (config.provider === "scripted") return { provider: "scripted", live: false };
  const pause = breaker.pause();
  if (pause) return { provider: config.provider, model: config.model, live: false, pausedUntil: pause.until, pauseReason: pause.reason };
  return { provider: config.provider, model: config.model, live: true };
}

/**
 * The active designer for the badge and `GET /api/ai/status`: the first model of the chain that is not paused,
 * or the first model's pause when every model is paused.
 */
export function aiStatus(env: Env = process.env, breakerOf: (provider: ProviderName) => Breaker = providerBreaker): AiStatus {
  const chain = resolveChain(env);
  if (chain.length === 0) return { provider: "scripted", live: false };
  const statuses = chain.map((config) => statusOf(config, breakerOf(config.provider)));
  return statuses.find((s) => s.live) ?? statuses[0];
}
