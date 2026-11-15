/**
 * A ceiling on live model calls for the whole server process, whoever asks: a missing address, many
 * cookies or a burst of visitors never adds up to more paid calls than this. Past it, the built-in
 * designer answers instead, and the draft says so.
 */

/** Live calls started per minute, all callers together. */
const LIVE_CALLS_PER_MINUTE = 60;

/** Live calls waiting for a reply at the same time. */
const LIVE_CALLS_AT_ONCE = 4;

const WINDOW_MS = 60_000;

export interface CallBudget {
  /** A release function when a live call may start now, or undefined when the ceiling is reached. Call it once the call ends. */
  take(): (() => void) | undefined;
}

/** Plain data, so code reloaded in development keeps counting on the same state. */
interface BudgetState {
  windowStart: number;
  started: number;
  running: number;
}

export function createBudget(
  limits: { perMinute: number; atOnce: number } = { perMinute: LIVE_CALLS_PER_MINUTE, atOnce: LIVE_CALLS_AT_ONCE },
  now: () => number = Date.now,
  state: BudgetState = { windowStart: 0, started: 0, running: 0 },
): CallBudget {
  return {
    take() {
      const at = now();
      if (at - state.windowStart >= WINDOW_MS) {
        state.windowStart = at;
        state.started = 0;
      }
      if (state.started >= limits.perMinute || state.running >= limits.atOnce) return undefined;
      state.started += 1;
      state.running += 1;
      let released = false;
      return () => {
        if (released) return;
        released = true;
        state.running -= 1;
      };
    },
  };
}

const holder = globalThis as typeof globalThis & { __workproofLiveCalls?: BudgetState };

/** The budget for this server process. Its state lives on globalThis, since each route bundle has its own copy of this module. */
export function providerBudget(): CallBudget {
  holder.__workproofLiveCalls ??= { windowStart: 0, started: 0, running: 0 };
  return createBudget(undefined, Date.now, holder.__workproofLiveCalls);
}
