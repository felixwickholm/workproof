import type { VoicePrivacy } from "./types";

/**
 * What happens to the voice, said plainly under the transcript. Each line has to stay true for
 * the engine in use: a browser that sends audio to its own speech service must not claim
 * the voice stays on the device.
 */
export function privacyLine(privacy: VoicePrivacy): string {
  switch (privacy) {
    case "on-device":
      return "Your voice stays on this device. WorkProof stores only the text.";
    case "server-once":
      return "Your voice is sent once to the speech service to make the text; WorkProof stores only the text.";
    case "browser-service":
      return "Your browser's speech service turns your voice into text; WorkProof stores only the text.";
    case "typed":
      return "WorkProof stores only the text.";
  }
}

/** Seconds as m:ss, for the take timer. */
export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/** Splits text into words for the live transcript. */
export function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * A speech-like loudness for the demo take, from 0 to 1: syllable-rate wobble under a slower
 * phrase swell, so the orb moves like someone talking even without a microphone.
 */
export function demoLevel(ms: number): number {
  const syllables = (Math.sin(ms / 70) + Math.sin(ms / 43 + 1.3)) / 4 + 0.5;
  const phrase = (Math.sin(ms / 900) + 1) / 2;
  return Math.min(1, Math.max(0, 0.15 + 0.6 * syllables * (0.4 + 0.6 * phrase)));
}
