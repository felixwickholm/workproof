import type { ChoiceOption, TaskFormat } from "@/lib/domain/types";

/** What the person produced in the work area, by format. Only the parts their format uses are set. */
export interface WorkParts {
  /** Choose: the option picked. */
  choice?: ChoiceOption["id"];
  /** Fix: the line, cell or sentence marked as wrong, as written in the material. */
  marked?: string;
  /** Make: the work. Fix: the fix. Read: the one thing the team must know. Choose: an optional note. */
  main: string;
  /** Read: what the person would check next (optional). */
  next?: string;
}

/** The longest "one thing the team must know" in a Read challenge. */
export const READ_LIMIT = 240;

/** Whether the work area holds enough to go on. The think-aloud is never required: it can be typed. */
export function workReady(format: TaskFormat, parts: WorkParts): boolean {
  switch (format) {
    case "choose":
      return parts.choice !== undefined;
    case "fix":
      return Boolean(parts.marked) && parts.main.trim().length > 0;
    case "read":
      return parts.main.trim().length > 0 && parts.main.length <= READ_LIMIT;
    case "make":
      return parts.main.trim().length > 0;
  }
}

/**
 * The work as one text, the same shape for every reader: the blind layer, the follow-up writer and the
 * company all read this. The picked option and the marked line are written out, so the text stands alone.
 */
export function composeAnswer(format: TaskFormat, parts: WorkParts, options?: readonly ChoiceOption[]): string {
  const main = parts.main.trim();
  switch (format) {
    case "choose": {
      const picked = options?.find((o) => o.id === parts.choice);
      const head = picked ? `I pick ${picked.id.toUpperCase()}: ${picked.title}.` : "";
      return [head, main].filter(Boolean).join("\n\n");
    }
    case "fix":
      return [parts.marked ? `What is wrong: ${parts.marked.trim()}` : "", main ? `The fix: ${main}` : ""].filter(Boolean).join("\n\n");
    case "read": {
      const next = parts.next?.trim();
      return [main ? `The one thing: ${main}` : "", next ? `What I would check next: ${next}` : ""].filter(Boolean).join("\n\n");
    }
    case "make":
      return main;
  }
}
