import { canRecogniseOnDevice, listenInBrowser, recognitionConstructor } from "./recognition";
import { speakInBrowser, stopBrowserSpeech } from "./synthesis";
import { VoiceError, type VoiceAdapter } from "./types";

/**
 * Web Speech API: recognition for listening, speechSynthesis for speaking. When the browser can
 * recognise the language on the device, it does so and the voice never leaves it.
 */
export async function createBrowserAdapter(lang: string): Promise<VoiceAdapter> {
  const Ctor = recognitionConstructor();
  if (!Ctor) throw new VoiceError("This browser cannot listen. Type your answer instead.");
  const onDevice = await canRecogniseOnDevice(Ctor, lang);
  return {
    name: "browser",
    canListen: true,
    canSpeak: typeof window.speechSynthesis !== "undefined",
    privacy: onDevice ? "on-device" : "browser-service",
    listen: (options) => listenInBrowser(Ctor, onDevice, options),
    speak: (text, options) => speakInBrowser(text, options?.lang ?? lang),
    stopSpeaking: stopBrowserSpeech,
  };
}
