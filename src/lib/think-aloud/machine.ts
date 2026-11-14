/**
 * The think-aloud recorder as a pure state machine, so every screen state has one name and the
 * transitions are tested without a browser.
 *
 * idle → asking (the browser asks for the screen and the microphone) → recording ⇄ paused → stopped.
 * A refused or missing microphone ends in an error; from there the person can go on by typing
 * what they would say ("typed"), so the work never stops.
 */

/** What is being captured: screen and microphone, microphone only, or nothing (the person types). */
export type Capture = "screen" | "mic" | "typed";

export type RecorderError = "denied" | "no-device";

export type RecorderState =
  | { status: "idle" }
  | { status: "asking"; wantScreen: boolean }
  /** `since` is when this stretch of recording began; `before` the seconds recorded before it. */
  | { status: "recording"; capture: Capture; since: number; before: number }
  | { status: "paused"; capture: Capture; before: number }
  | { status: "stopped"; capture: Capture; seconds: number }
  | { status: "error"; reason: RecorderError };

export type RecorderEvent =
  | { type: "start"; wantScreen: boolean }
  /** The browser gave what it could: the screen may be missing when it was skipped or is not supported here. */
  | { type: "granted"; capture: Exclude<Capture, "typed">; at: number }
  | { type: "failed"; reason: RecorderError }
  /** Go on without recording: the person types what they would say. */
  | { type: "type-instead"; at: number }
  | { type: "pause"; at: number }
  | { type: "resume"; at: number }
  | { type: "stop"; at: number }
  | { type: "reset" };

export const IDLE: RecorderState = { status: "idle" };

const secondsBetween = (from: number, to: number) => Math.max(0, (to - from) / 1000);

/** The next state. An event that does not fit the current state changes nothing. */
export function recorderReducer(state: RecorderState, event: RecorderEvent): RecorderState {
  if (event.type === "reset") return IDLE;
  switch (state.status) {
    case "idle":
      if (event.type === "start") return { status: "asking", wantScreen: event.wantScreen };
      if (event.type === "type-instead") return { status: "recording", capture: "typed", since: event.at, before: 0 };
      return state;
    case "asking":
      if (event.type === "granted") return { status: "recording", capture: event.capture, since: event.at, before: 0 };
      if (event.type === "failed") return { status: "error", reason: event.reason };
      return state;
    case "error":
      if (event.type === "start") return { status: "asking", wantScreen: event.wantScreen };
      if (event.type === "type-instead") return { status: "recording", capture: "typed", since: event.at, before: 0 };
      return state;
    case "recording":
      if (event.type === "pause") return { status: "paused", capture: state.capture, before: state.before + secondsBetween(state.since, event.at) };
      if (event.type === "stop") return { status: "stopped", capture: state.capture, seconds: Math.round(state.before + secondsBetween(state.since, event.at)) };
      return state;
    case "paused":
      if (event.type === "resume") return { status: "recording", capture: state.capture, since: event.at, before: state.before };
      if (event.type === "stop") return { status: "stopped", capture: state.capture, seconds: Math.round(state.before) };
      return state;
    case "stopped":
      return state;
  }
}

/** Seconds recorded so far, at `now`. Paused time does not count. */
export function elapsedSeconds(state: RecorderState, now: number): number {
  switch (state.status) {
    case "recording":
      return state.before + secondsBetween(state.since, now);
    case "paused":
      return state.before;
    case "stopped":
      return state.seconds;
    default:
      return 0;
  }
}

/** True while the person is working with the recorder on or paused. */
export function isLive(state: RecorderState): state is Extract<RecorderState, { status: "recording" | "paused" }> {
  return state.status === "recording" || state.status === "paused";
}

/** What a failed `getUserMedia` call means for the person: refused, or no microphone at all. */
export function mediaErrorReason(error: unknown): RecorderError {
  const name = error instanceof Error || (typeof error === "object" && error !== null && "name" in error) ? String((error as { name: unknown }).name) : "";
  return name === "NotFoundError" || name === "OverconstrainedError" || name === "NotReadableError" ? "no-device" : "denied";
}
