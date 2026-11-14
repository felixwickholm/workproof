import { claudeDesigner } from "./claude/designer";
import { geminiDesigner } from "./gemini/designer";
import { guarded } from "./guarded";
import { providerBreaker, type Breaker } from "./provider/breaker";
import { resolveProvider, type ProviderConfig } from "./provider/select";
import { scriptedDesigner } from "./scripted";
import type { TaskDesigner } from "./task-designer";

export { aiStatus } from "./provider/select";

type OnFallback = (method: string, error: unknown) => void;

/** One line, no key and no user text: the provider, the method and the error's own short message. */
function warnFallback(provider: string): OnFallback {
  return (method, error) => {
    const reason = error instanceof Error ? error.message.replace(/\s+/g, " ").slice(0, 200) : "unknown error";
    console.warn(`${provider} ${method} fell back to the scripted designer: ${reason}`);
  };
}

/** The unguarded model designer for a live provider. */
export function modelDesignerFor(config: Exclude<ProviderConfig, { provider: "scripted" }>): TaskDesigner {
  return config.provider === "claude" ? claudeDesigner(config.apiKey, config.model) : geminiDesigner(config.apiKey, config.model);
}

/**
 * The designer for a provider, guarded, with the scripted designer answering whenever the model fails or is rejected.
 * After a provider failure the model is skipped for a while, and only that first failure is logged.
 */
export function createDesigner(config: ProviderConfig, onFallback: OnFallback = warnFallback(config.provider), breaker: Breaker = providerBreaker()): TaskDesigner {
  if (config.provider === "scripted") return guarded(scriptedDesigner);
  return guarded(modelDesignerFor(config), { designer: scriptedDesigner, onFallback, breaker });
}

/**
 * The scripted designer runs by default. A key in the environment switches a model on with no code change:
 * ANTHROPIC_API_KEY for Claude, GEMINI_API_KEY or GOOGLE_API_KEY for Gemini, AI_PROVIDER to choose.
 */
export function getTaskDesigner(): TaskDesigner {
  return createDesigner(resolveProvider(process.env));
}
