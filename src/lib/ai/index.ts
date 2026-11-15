import { claudeDesigner } from "./claude/designer";
import { geminiDesigner } from "./gemini/designer";
import { guarded } from "./guarded";
import { providerBreaker, type Breaker } from "./provider/breaker";
import { providerBudget, type CallBudget } from "./provider/budget";
import { resolveChain, type LiveConfig, type ProviderConfig } from "./provider/select";
import { scriptedDesigner } from "./scripted";
import type { TaskDesigner } from "./task-designer";

export { aiStatus } from "./provider/select";

type OnFallback = (method: string, error: unknown) => void;

/** One line, no key and no user text: the provider, the method and the error's own short message. */
function warnFallback(provider: string): OnFallback {
  return (method, error) => {
    const reason = error instanceof Error ? error.message.replace(/\s+/g, " ").slice(0, 200) : "unknown error";
    console.warn(`${provider} ${method} fell back to the next designer: ${reason}`);
  };
}

/** The unguarded model designer for a live provider. */
export function modelDesignerFor(config: LiveConfig): TaskDesigner {
  return config.provider === "claude" ? claudeDesigner(config.apiKey, config.model) : geminiDesigner(config.apiKey, config.model);
}

/**
 * The designer for a provider, guarded, with the scripted designer answering whenever the model fails or is rejected.
 * After a provider failure the model is skipped for a while, and only that first failure is logged. Past the
 * process-wide ceiling on live calls the scripted designer answers too, and `draftedBy` says so.
 */
export function createDesigner(
  config: ProviderConfig,
  onFallback: OnFallback = warnFallback(config.provider),
  breaker: Breaker = providerBreaker(config.provider),
  budget: CallBudget = providerBudget(),
  next: TaskDesigner = guarded(scriptedDesigner),
): TaskDesigner {
  if (config.provider === "scripted") return guarded(scriptedDesigner);
  return guarded(modelDesignerFor(config), { designer: next, onFallback, breaker, budget });
}

/**
 * Every live model in order, each falling back to the next, and the scripted designer last, so a draft always comes back.
 * Each model has its own breaker; all share one budget of live calls.
 */
function createChain(chain: readonly LiveConfig[]): TaskDesigner {
  return chain.reduceRight<TaskDesigner>((next, config) => createDesigner(config, undefined, undefined, undefined, next), guarded(scriptedDesigner));
}

/**
 * The scripted designer runs when no key is set. A key in the environment switches a model on with no code change:
 * GEMINI_API_KEY or GOOGLE_API_KEY for Gemini, ANTHROPIC_API_KEY for Claude, AI_PROVIDER to put one first.
 */
export function getTaskDesigner(): TaskDesigner {
  return createChain(resolveChain(process.env));
}
