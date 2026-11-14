import { describe, expect, it } from "vitest";
import { detectCapabilities, pickAdapter, type VoiceCapabilities } from "./pick";
import type { VoiceStatus } from "./types";

const chrome: VoiceCapabilities = { recognition: true, synthesis: true, recording: true };
const firefox: VoiceCapabilities = { recognition: false, synthesis: true, recording: true };
const inAppBrowser: VoiceCapabilities = { recognition: false, synthesis: false, recording: false };
const server: VoiceStatus = { provider: "elevenlabs", tts: true, stt: true };
const browserOnly: VoiceStatus = { provider: "browser", tts: false, stt: false };

describe("pickAdapter", () => {
  it("uses the server service when it is set up and the browser can record", () => {
    expect(pickAdapter(chrome, server)).toBe("elevenlabs");
    expect(pickAdapter(firefox, server)).toBe("elevenlabs");
  });

  it("uses browser recognition when the server has no service", () => {
    expect(pickAdapter(chrome, browserOnly)).toBe("browser");
    expect(pickAdapter(chrome, null)).toBe("browser");
  });

  it("falls back to browser recognition when the server service cannot record here", () => {
    expect(pickAdapter({ ...chrome, recording: false }, server)).toBe("browser");
  });

  it("falls back to typing when nothing can listen", () => {
    expect(pickAdapter(firefox, browserOnly)).toBe("typed");
    expect(pickAdapter(inAppBrowser, server)).toBe("typed");
    expect(pickAdapter(inAppBrowser, null)).toBe("typed");
  });
});

describe("detectCapabilities", () => {
  it("reads the prefixed recognition and a working recorder", () => {
    const scope = {
      webkitSpeechRecognition: function Recognition() {},
      speechSynthesis: {},
      MediaRecorder: function Recorder() {},
      navigator: { mediaDevices: { getUserMedia: () => undefined } },
    };
    expect(detectCapabilities(scope)).toEqual({ recognition: true, synthesis: true, recording: true });
  });

  it("finds nothing in an empty scope", () => {
    expect(detectCapabilities({})).toEqual({ recognition: false, synthesis: false, recording: false });
  });
});
