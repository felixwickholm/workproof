import { failureOf, type FailureKind } from "./http";

/** How long a failing provider is skipped. A broken key or an empty quota does not fix itself in seconds. */
export const PAUSE_MS = 5 * 60_000;

export interface Pause {
  /** ISO time when the live provider is tried again. */
  until: string;
  reason: FailureKind;
}

/**
 * Skips a live provider for a while after it failed, so every draft does not wait for the same failure.
 * Only failures of the service itself count; a reply the guard rejected leaves the provider in use.
 */
export interface Breaker {
  /** The current pause, or undefined when the provider may be called. */
  pause(): Pause | undefined;
  /** Opens a pause when the error is a provider failure. Returns true when it did. */
  record(error: unknown): boolean;
}

/** The open pause, if any. Plain data, so code reloaded in development keeps reading the same state. */
interface BreakerState {
  open?: { until: number; reason: FailureKind };
}

export function createBreaker(now: () => number = Date.now, state: BreakerState = {}): Breaker {
  return {
    pause() {
      if (state.open && now() >= state.open.until) state.open = undefined;
      return state.open && { until: new Date(state.open.until).toISOString(), reason: state.open.reason };
    },
    record(error) {
      const reason = failureOf(error);
      if (!reason) return false;
      state.open = { until: now() + PAUSE_MS, reason };
      return true;
    },
  };
}

const holder = globalThis as typeof globalThis & { __workprintProviderPause?: BreakerState };

/** The breaker for this server process. Its state lives on globalThis, since each route bundle has its own copy of this module. */
export function providerBreaker(): Breaker {
  holder.__workprintProviderPause ??= {};
  return createBreaker(Date.now, holder.__workprintProviderPause);
}
