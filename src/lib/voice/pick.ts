import type { AdapterName, VoiceStatus } from "./types";

/** What this browser can do, read once from `window` (see `detectCapabilities`). */
export interface VoiceCapabilities {
  /** `SpeechRecognition` or `webkitSpeechRecognition` exists. */
  recognition: boolean;
  /** `speechSynthesis` exists. */
  synthesis: boolean;
  /** `getUserMedia` and `MediaRecorder` exist, so a take can be recorded for the server. */
  recording: boolean;
}

/**
 * Chooses how a person answers by voice. The server service wins when it is set up and the
 * browser can record; then the browser's own recognition; otherwise typing, so the flow
 * never dead-ends.
 */
export function pickAdapter(capabilities: VoiceCapabilities, status: VoiceStatus | null): AdapterName {
  if (status?.provider === "elevenlabs" && status.stt && capabilities.recording) return "elevenlabs";
  if (capabilities.recognition) return "browser";
  return "typed";
}

type VoiceWindow = Partial<{
  SpeechRecognition: unknown;
  webkitSpeechRecognition: unknown;
  speechSynthesis: unknown;
  MediaRecorder: unknown;
  navigator: { mediaDevices?: { getUserMedia?: unknown } };
}>;

export function detectCapabilities(scope: VoiceWindow): VoiceCapabilities {
  return {
    recognition: Boolean(scope.SpeechRecognition ?? scope.webkitSpeechRecognition),
    synthesis: Boolean(scope.speechSynthesis),
    recording: typeof scope.MediaRecorder === "function" && typeof scope.navigator?.mediaDevices?.getUserMedia === "function",
  };
}
