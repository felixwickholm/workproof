import type { Challenge } from "@/lib/domain/types";

/** Text or voice: what a person hands in for one question. */
export interface Answer {
  text: string;
  spoken: boolean;
}

/** A taster made for a job outside the task library carries a note; the person is told plainly. */
export type Taster = Challenge & { note?: string };

/** The steps a refresh can come back to. Before the task there is nothing to lose; after sending, nothing to keep. */
export type SavedStep = "task" | "explain" | "name";

/** The flow mid-task, kept for this tab only, so a refresh lands on the same question with the same words. */
export interface SavedTry {
  step: SavedStep;
  job: string;
  /** The task itself, with its id: a taster is made once and cannot be fetched again by job. */
  challenge: Taster;
  startedAt: number;
  answer: Answer;
  /** The option picked in a Choose task. */
  choice?: "a" | "b";
  question: string;
  explain: Answer;
}

const KEY = "workproof.try";
const STEPS: readonly SavedStep[] = ["task", "explain", "name"];

const isAnswer = (value: unknown): value is Answer =>
  typeof value === "object" && value !== null && typeof (value as Answer).text === "string" && typeof (value as Answer).spoken === "boolean";

/** The saved flow, or null when it is missing, from an older shape, or not readable. */
export function parseSavedTry(raw: string | null): SavedTry | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SavedTry>;
    const valid =
      STEPS.includes(value.step as SavedStep) &&
      typeof value.job === "string" &&
      typeof value.challenge?.id === "string" &&
      typeof value.startedAt === "number" &&
      typeof value.question === "string" &&
      isAnswer(value.answer) &&
      isAnswer(value.explain) &&
      (value.choice === undefined || value.choice === "a" || value.choice === "b");
    return valid ? (value as SavedTry) : null;
  } catch {
    return null;
  }
}

/**
 * The saved flow as stored text, a stable value for `useSyncExternalStore`. Every access is guarded:
 * storage can be blocked in a private window, and the flow still works without it.
 */
export function readSavedTry(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveTry(state: SavedTry): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: a refresh starts over, nothing else changes.
  }
}

export function clearTry(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing was stored.
  }
}
