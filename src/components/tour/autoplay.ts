import type { TourKind, TourStep } from "./steps";

/** Reading pace for a step that moves on by itself: about 3 words a second, plus time to look. */
const WORDS_PER_SECOND = 3;
const LOOK_MS = 2500;
/** No step goes faster than a comfortable glance or slower than the one-minute budget allows. */
export const MIN_STEP_MS = 8500;
export const MAX_STEP_MS = 10500;

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** How long a step stays before the walkthrough moves on, from the length of its words. */
export function stepDuration(step: Pick<TourStep, "title" | "body">): number {
  const ms = (words(step.body) / WORDS_PER_SECOND) * 1000 + LOOK_MS;
  return Math.round(Math.min(MAX_STEP_MS, Math.max(MIN_STEP_MS, ms)));
}

/**
 * Whether a step moves on by itself: only in the one-minute walkthrough, never on its last step
 * (the visitor picks a way on), and never with reduced motion (the visitor presses Next).
 */
export function autoAdvances(kind: TourKind, index: number, stepCount: number, reduce: boolean): boolean {
  return kind === "minute" && !reduce && index < stepCount - 1;
}

/** Everything that holds the timer still. Any one of them pauses it. */
export interface Holds {
  /** The visitor pressed Pause. */
  paused: boolean;
  /** A mouse rests on the card. */
  hover: boolean;
  /** A keyboard user is on one of the card's buttons. */
  focus: boolean;
  /** The tab is in the background. */
  hidden: boolean;
}

export const noHolds: Holds = { paused: false, hover: false, focus: false, hidden: false };

export function isHeld(holds: Holds): boolean {
  return holds.paused || holds.hover || holds.focus || holds.hidden;
}

/** What is left of a step's time once `progress` (0 to 1) of it has run. */
export function remainingMs(duration: number, progress: number): number {
  return Math.max(0, duration * (1 - Math.min(1, Math.max(0, progress))));
}
