import type { TaskFormat } from "@/lib/domain/types";

/**
 * A scripted think-aloud session for the guided demo: it plays on the real work screen, so the demo
 * never depends on a live microphone. Pure: the frame at any moment is a function of the time.
 */
export interface DemoScript {
  format: TaskFormat;
  /** The seeded think-aloud transcript, streamed word by word. */
  transcript: string;
  /** The text typed into the work area (the note, the fix, the one thing, the work). */
  answer: string;
  /** Choose: the option the cursor picks. */
  choice?: "a" | "b";
  /** Fix: the unit the cursor marks. */
  mark?: number;
  /** The real length of the recorded session; the pill's clock runs through it in fast-forward. */
  seconds: number;
}

/** Where the scripted cursor points. */
export type CursorTarget = "rest" | "option-a" | "option-b" | "mark" | "editor" | "stop";

export interface DemoFrame {
  /** 0 to 1 through the whole session. */
  progress: number;
  /** The recorder's clock, in session seconds. */
  clock: number;
  /** Transcript words shown so far. */
  words: number;
  /** Characters of the answer typed so far. */
  typed: number;
  picked: "a" | "b" | null;
  marked: number | null;
  cursor: CursorTarget;
  /** The cursor is pressing (a short click pulse). */
  pressing: boolean;
  done: boolean;
}

/** One demo session lasts this long on screen, whatever the real length. */
export const DEMO_MS = 18_000;

/** When the hand acts, as a share of the session: pick or mark, then type, then stop. */
const PHASES = { act: 0.22, typeFrom: 0.34, typeTo: 0.86, stop: 0.95 } as const;
const PRESS = 0.025;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** The frame `ms` milliseconds into the session. */
export function frameAt(script: DemoScript, ms: number): DemoFrame {
  const progress = clamp01(ms / DEMO_MS);
  const acts = script.format === "choose" || script.format === "fix";
  const typing = clamp01((progress - PHASES.typeFrom) / (PHASES.typeTo - PHASES.typeFrom));
  const typesAnything = script.answer.length > 0;

  let cursor: CursorTarget = "rest";
  if (acts && progress >= PHASES.act - 0.08 && progress < PHASES.typeFrom) cursor = script.format === "choose" ? (script.choice === "b" ? "option-b" : "option-a") : "mark";
  else if (typesAnything && progress >= PHASES.typeFrom && progress < PHASES.typeTo) cursor = "editor";
  else if (progress >= PHASES.stop - 0.06) cursor = "stop";

  const pressAt = (at: number) => progress >= at && progress < at + PRESS;
  return {
    progress,
    clock: Math.round(progress * script.seconds),
    // Words lead the hand a little, as people speak while they move.
    words: Math.round(wordCount(script.transcript) * clamp01(progress / PHASES.stop)),
    typed: typesAnything ? Math.round(script.answer.length * typing) : 0,
    picked: script.format === "choose" && progress >= PHASES.act ? (script.choice ?? "a") : null,
    marked: script.format === "fix" && progress >= PHASES.act ? (script.mark ?? 0) : null,
    cursor,
    pressing: (acts && pressAt(PHASES.act)) || pressAt(PHASES.stop),
    done: progress >= 1,
  };
}

/** The first `count` words of a transcript, keeping its own spacing. */
export function firstWords(text: string, count: number): string {
  if (count <= 0) return "";
  const words = text.trim().split(/\s+/);
  return words.slice(0, count).join(" ");
}
