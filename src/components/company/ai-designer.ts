import type { AiStatus } from "@/lib/ai/provider/select";
import type { DraftedBy } from "@/lib/domain/types";

const LINES: Record<DraftedBy, string> = {
  scripted: "Drafted by the built-in task designer",
  claude: "Drafted by Claude",
  gemini: "Drafted by Gemini",
};

/** A live model failed on this very draft. */
export const FALLBACK_LINE = "The live model did not answer in time, so the built-in designer wrote this draft.";
/** The live model was already paused when the draft was asked for, so it was never tried. */
export const PAUSED_LINE = "The live model is paused right now, so the built-in designer wrote this draft.";

/** Who drafted the task, in words. Anything unknown reads as the built-in designer, which is the fallback. */
export function designerLine(draftedBy: unknown): string {
  return typeof draftedBy === "string" && Object.hasOwn(LINES, draftedBy) ? LINES[draftedBy as DraftedBy] : LINES.scripted;
}

/**
 * Why the built-in designer wrote a draft although a live model is configured, judged from the
 * status read just before asking: paused then, or failed on this draft. Null when nothing needs saying.
 */
export function fallbackLine(draftedBy: DraftedBy | undefined, before: Pick<AiStatus, "provider" | "live" | "pausedUntil"> | null): string | null {
  if (!before || before.provider === "scripted" || (draftedBy ?? "scripted") !== "scripted") return null;
  return !before.live && before.pausedUntil ? PAUSED_LINE : FALLBACK_LINE;
}
