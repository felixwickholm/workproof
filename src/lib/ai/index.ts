import { claudeDesigner } from "./claude/designer";
import { guarded } from "./guarded";
import { scriptedDesigner } from "./scripted";
import type { TaskDesigner } from "./task-designer";

export type { TaskDesigner } from "./task-designer";

/**
 * The scripted designer runs by default. With ANTHROPIC_API_KEY set, Claude drafts and the
 * scripted designer answers whenever Claude fails or its output does not pass the guard.
 */
export function getTaskDesigner(): TaskDesigner {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return guarded(scriptedDesigner);
  return guarded(claudeDesigner(apiKey, process.env.ANTHROPIC_MODEL || undefined), scriptedDesigner, (method, error) => {
    console.warn(`Claude ${method} fell back to the scripted designer: ${error instanceof Error ? error.message : "unknown error"}`);
  });
}
