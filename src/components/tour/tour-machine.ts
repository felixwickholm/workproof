/**
 * The tour's position as a pure reducer. The card keeps showing the current step while
 * the next one is prepared (stage set, page opened, target found); only then does it switch.
 */

export type TourState =
  | { open: false }
  | {
      open: true;
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
       * once, already in its place; a slow first step reveals it early with a quiet Next.
       */
      revealed: boolean;
    };

export type TourAction =
  | { type: "start"; at?: number }
  | { type: "next" }
  | { type: "back" }
  | { type: "arrived"; run: number; found: boolean }
  | { type: "reveal" }
  | { type: "close" };

export const closedTour: TourState = { open: false };

export function tourReducer(state: TourState, action: TourAction, stepCount: number): TourState {
  switch (action.type) {
    case "start": {
      const at = Math.min(Math.max(0, action.at ?? 0), stepCount - 1);
      if (!state.open) return { open: true, index: at, pending: at, run: 1, spotlight: false, revealed: false };
      // A start asked for while the tour shows (a Show me button under the card): the card stays and
      // glides to the asked step, unless it is already there.
      if (state.index === at && state.pending === null) return state;
      return { ...state, pending: at, run: state.run + 1 };
    }
    case "close":
      return closedTour;
    case "next":
    case "back": {
      if (!state.open || state.pending !== null) return state;
      const to = state.index + (action.type === "next" ? 1 : -1);
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

/** "3 of 15". */
export function counterText(index: number, stepCount: number) {
  return `${index + 1} of ${stepCount}`;
}

/** What a screen reader hears when a step settles: "Step 3 of 15: He picks a challenge from Halla Supply." */
export function announcement(index: number, stepCount: number, title: string) {
  return `Step ${index + 1} of ${stepCount}: ${title}`;
}
