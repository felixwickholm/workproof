import { speakInBrowser, stopBrowserSpeech } from "./synthesis";
import { VoiceError, type VoiceAdapter } from "./types";

/**
 * For browsers that cannot listen (Firefox, in-app browsers, headless tests). The sheet shows a
 * text field instead, so nobody gets stuck; it can still read the question aloud when possible.
 */
export function createTypedAdapter(lang: string): VoiceAdapter {
  const canSpeak = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
  return {
    name: "typed",
    canListen: false,
    canSpeak,
    privacy: "typed",
    listen: () => Promise.reject(new VoiceError("This browser cannot listen. Type what you would say.")),
    speak: (text, options) => (canSpeak ? speakInBrowser(text, options?.lang ?? lang) : Promise.resolve()),
    stopSpeaking: stopBrowserSpeech,
  };
}
