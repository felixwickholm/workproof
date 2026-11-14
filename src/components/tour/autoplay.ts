import type { TourStep } from "./steps";

/** Time to look at the lit part of the screen before and after reading the card. */
const LOOK_MS = 3500;
/** A slow reader's pace on short plain words. */
const MS_PER_WORD = 250;
/** No step goes faster than a comfortable glance or slower than the tour's budget allows. */
export const MIN_STEP_MS = 6500;
export const MAX_STEP_MS = 11_000;

/** The words a card shows: the headline and its sentences. */
export function cardWords(step: Pick<TourStep, "title" | "body">): string[] {
  return `${step.title} ${step.body ?? ""}`.split(/\s+/).filter(Boolean);
}

/** How long a step stays before the tour moves on, from the length of its words. */
export function stepDuration(step: Pick<TourStep, "title" | "body">): number {
  const ms = LOOK_MS + cardWords(step).length * MS_PER_WORD;
  return Math.round(Math.min(MAX_STEP_MS, Math.max(MIN_STEP_MS, ms)));
}

/**
 * Whether a step moves on by itself: never on the end card (the visitor picks a way on), and never
 * with reduced motion (the visitor presses Next).
 */
export function autoAdvances(index: number, stepCount: number, reduce: boolean): boolean {
  return !reduce && index < stepCount - 1;
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
