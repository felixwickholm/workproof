import { describe, expect, it } from "vitest";
import { elapsedSeconds, IDLE, isLive, mediaErrorReason, recorderReducer, type RecorderEvent, type RecorderState } from "./machine";

const run = (events: RecorderEvent[], from: RecorderState = IDLE) => events.reduce(recorderReducer, from);

describe("think-aloud recorder", () => {
  it("goes idle → asking → recording → paused → recording → stopped and counts only recorded time", () => {
    const asking = run([{ type: "start", wantScreen: true }]);
    expect(asking).toEqual({ status: "asking", wantScreen: true });
    const recording = run([{ type: "granted", capture: "screen", at: 1_000 }], asking);
    expect(recording.status).toBe("recording");
    expect(elapsedSeconds(recording, 11_000)).toBe(10);
    const paused = run([{ type: "pause", at: 11_000 }], recording);
    expect(elapsedSeconds(paused, 99_000)).toBe(10);
    const again = run([{ type: "resume", at: 50_000 }], paused);
    const stopped = run([{ type: "stop", at: 55_500 }], again);
    expect(stopped).toEqual({ status: "stopped", capture: "screen", seconds: 16 });
  });

  it("ends in an error when the microphone is refused or missing, and can go on by typing", () => {
    const denied = run([{ type: "start", wantScreen: false }, { type: "failed", reason: "denied" }]);
    expect(denied).toEqual({ status: "error", reason: "denied" });
    const typing = run([{ type: "type-instead", at: 0 }], denied);
    expect(typing).toMatchObject({ status: "recording", capture: "typed" });
    expect(run([{ type: "start", wantScreen: true }], denied).status).toBe("asking");
  });

  it("ignores events that do not fit the state", () => {
    expect(run([{ type: "pause", at: 1 }])).toBe(IDLE);
    const stopped: RecorderState = { status: "stopped", capture: "mic", seconds: 4 };
    expect(run([{ type: "resume", at: 2 }, { type: "start", wantScreen: true }], stopped)).toBe(stopped);
    expect(run([{ type: "reset" }], stopped)).toBe(IDLE);
  });

  it("knows when it is live", () => {
    expect(isLive({ status: "recording", capture: "mic", since: 0, before: 0 })).toBe(true);
    expect(isLive({ status: "paused", capture: "mic", before: 0 })).toBe(true);
    expect(isLive(IDLE)).toBe(false);
  });

  it("tells a missing microphone from a refused one", () => {
    expect(mediaErrorReason({ name: "NotFoundError" })).toBe("no-device");
    expect(mediaErrorReason({ name: "NotAllowedError" })).toBe("denied");
    expect(mediaErrorReason("weird")).toBe("denied");
  });
});
