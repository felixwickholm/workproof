/**
 * The tour's position as a pure reducer. The card keeps showing the current step while
 * the next one is prepared (stage set, page opened, target found); only then does it switch.
 */

import type { TourKind } from "./steps";

export type TourState =
  | { open: false }
  | {
      open: true;
      /** Which tour runs. */
      kind: TourKind;
      /** The step on the card. */
      index: number;
      /** The step being prepared, or null when the card shows a settled step. */
      pending: number | null;
      /** Counts every move, so the result of an abandoned move is ignored. */
      run: number;
      /** Whether the shown step found its target on the page. */
      spotlight: boolean;
      /**
       * Whether the layer is drawn. The first step is prepared out of sight, so the card appears
       * once, already in its place; a slow first step reveals it early with a busy Next.
       */
      revealed: boolean;
    };

export type TourAction =
  | { type: "start"; kind?: TourKind }
  | { type: "next" }
  | { type: "back" }
  | { type: "arrived"; run: number; found: boolean }
  | { type: "reveal" }
  | { type: "close" };

export const closedTour: TourState = { open: false };

/** How many steps a tour has: one count for all, or one per kind. */
export type StepCount = number | Record<TourKind, number>;

export function tourReducer(state: TourState, action: TourAction, steps: StepCount): TourState {
  switch (action.type) {
    case "start": {
      const kind = action.kind ?? "minute";
      if (!state.open) return { open: true, kind, index: 0, pending: 0, run: 1, spotlight: false, revealed: false };
      // Another tour asked for while one shows: the card stays where it is and the new tour's first
      // step is prepared under it.
      if (state.kind === kind) return state;
      return { open: true, kind, index: 0, pending: 0, run: state.run + 1, spotlight: false, revealed: state.revealed };
    }
    case "close":
      return closedTour;
    case "next":
    case "back": {
      if (!state.open || state.pending !== null) return state;
      const to = state.index + (action.type === "next" ? 1 : -1);
      const stepCount = typeof steps === "number" ? steps : steps[state.kind];
      if (to < 0 || to >= stepCount) return state;
      return { ...state, pending: to, run: state.run + 1 };
    }
    case "arrived":
      if (!state.open || state.pending === null || action.run !== state.run) return state;
      return { ...state, index: state.pending, pending: null, spotlight: action.found, revealed: true };
    case "reveal":
      return state.open && !state.revealed ? { ...state, revealed: true } : state;
  }
}

/** "3 of 7". */
export function counterText(index: number, stepCount: number) {
  return `${index + 1} of ${stepCount}`;
}

/** What a screen reader hears when a step settles: "Step 3 of 7: Her name is hidden." */
export function announcement(index: number, stepCount: number, title: string) {
  return `Step ${index + 1} of ${stepCount}: ${title}`;
}
