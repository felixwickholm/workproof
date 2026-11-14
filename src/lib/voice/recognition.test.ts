import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listenInBrowser, readResults, recognitionErrorMessage, type RecognitionConstructor, type RecognitionResultList } from "./recognition";

function results(...items: [string, boolean][]): RecognitionResultList {
  return Object.assign(
    items.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal })),
    { length: items.length },
  );
}

/** A stand-in for the browser engine that the test drives by hand. */
class FakeRecognition {
  static last: FakeRecognition;
  lang = "";
  continuous = false;
  interimResults = false;
  starts = 0;
  onstart: (() => void) | null = null;
  onresult: ((event: { results: RecognitionResultList }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {
    this.starts += 1;
    queueMicrotask(() => this.onstart?.());
  }
  stop() {
    queueMicrotask(() => this.onend?.());
  }
  abort() {}
}

describe("readResults", () => {
  it("splits settled words from the ones still being guessed", () => {
    expect(readResults(results(["I chose", true], [" the shorter route ", true], ["because", false]))).toEqual({
      text: "I chose the shorter route",
      interim: "because",
    });
  });
});

describe("recognitionErrorMessage", () => {
  it("keeps listening through silence and our own abort", () => {
    expect(recognitionErrorMessage("no-speech")).toBeNull();
    expect(recognitionErrorMessage("aborted")).toBeNull();
  });

  it("explains blocked, missing and offline microphones in plain words", () => {
    expect(recognitionErrorMessage("not-allowed")).toMatch(/not allowed/);
    expect(recognitionErrorMessage("audio-capture")).toMatch(/No microphone/);
    expect(recognitionErrorMessage("network")).toMatch(/network/);
    expect(recognitionErrorMessage("something-new")).toMatch(/type your answer/);
  });
});

describe("listenInBrowser", () => {
  beforeEach(() => vi.stubGlobal("window", globalThis));
  afterEach(() => vi.unstubAllGlobals());

  const Ctor = FakeRecognition as unknown as RecognitionConstructor;

  it("restarts after a silent end and keeps the earlier words", async () => {
    const partials: string[] = [];
    const session = await listenInBrowser(Ctor, false, { lang: "en-US", onPartial: (text) => partials.push(text) });
    const engine = FakeRecognition.last;
    expect(engine.continuous).toBe(true);
    expect(engine.interimResults).toBe(true);

    engine.onresult?.({ results: results(["First part", true]) });
    engine.onend?.();
    expect(engine.starts).toBe(2);

    engine.onresult?.({ results: results(["second part", true], ["and more", false]) });
    expect(partials.at(-1)).toBe("First part second part");
    await expect(session.stop()).resolves.toBe("First part second part and more");
  });

  it("rejects with a plain reason when the microphone is blocked", async () => {
    class Blocked extends FakeRecognition {
      start() {
        queueMicrotask(() => this.onerror?.({ error: "not-allowed" }));
      }
    }
    await expect(listenInBrowser(Blocked as unknown as RecognitionConstructor, false, { lang: "en-US", onPartial: () => {} })).rejects.toThrow(
      /not allowed/,
    );
  });

  it("gives up with a plain reason when the engine never starts", async () => {
    vi.useFakeTimers();
    class Silent extends FakeRecognition {
      start() {}
    }
    const listening = listenInBrowser(Silent as unknown as RecognitionConstructor, false, { lang: "en-US", onPartial: () => {} });
    vi.advanceTimersByTime(15_000);
    await expect(listening).rejects.toThrow(/could not start/);
    vi.useRealTimers();
  });

  it("reports a network failure after listening started", async () => {
    const onError = vi.fn();
    await listenInBrowser(Ctor, false, { lang: "en-US", onPartial: () => {}, onError });
    FakeRecognition.last.onerror?.({ error: "network" });
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/network/));
  });
});
