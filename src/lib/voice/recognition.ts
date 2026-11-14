import { startLevelMeter } from "./level";
import { VoiceError, type ListenOptions, type ListenSession } from "./types";

/** The slice of the Web Speech API used here. TypeScript's DOM types do not include it. */
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: RecognitionAlternative;
}
export interface RecognitionResultList {
  readonly length: number;
  [index: number]: RecognitionResult;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  processLocally?: boolean;
  onstart: (() => void) | null;
  onresult: ((event: { results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
export interface RecognitionConstructor {
  new (): Recognition;
  /** Chrome 139+: whether a language can be recognised on this device. */
  available?(options: { langs: string[]; processLocally: boolean }): Promise<string>;
}

export function recognitionConstructor(): RecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
}

/** True when this browser can turn speech into text without sending the audio anywhere. */
export async function canRecogniseOnDevice(Ctor: RecognitionConstructor, lang: string): Promise<boolean> {
  if (typeof Ctor.available !== "function") return false;
  // Asking about on-device recognition crashes the whole tab in automated (headless) Chromium.
  if (typeof navigator !== "undefined" && navigator.webdriver) return false;
  try {
    return (await Ctor.available({ langs: [lang], processLocally: true })) === "available";
  } catch {
    return false;
  }
}

/** Splits the engine's running results into settled text and the part still being guessed. */
export function readResults(results: RecognitionResultList): { text: string; interim: string } {
  const settled: string[] = [];
  const pending: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const words = results[i][0]?.transcript.trim();
    if (words) (results[i].isFinal ? settled : pending).push(words);
  }
  return { text: settled.join(" "), interim: pending.join(" ") };
}

/**
 * The person-facing reason for a recognition error, or null when listening should carry on
 * (silence, or our own abort).
 */
export function recognitionErrorMessage(code: string): string | null {
  switch (code) {
    case "no-speech":
    case "aborted":
      return null;
    case "not-allowed":
    case "service-not-allowed":
      return "The microphone is not allowed. Allow it in the browser settings, or type your answer.";
    case "audio-capture":
      return "No microphone was found. Connect one, or type your answer.";
    case "network":
      return "Speech to text needs a network connection here. Check the connection, or type your answer.";
    case "language-not-supported":
      return "This browser cannot listen in this language. Type your answer instead.";
    default:
      return "Listening stopped. Try again, or type your answer.";
  }
}

/** Long enough for a person to answer the browser's microphone question first. */
const START_TIMEOUT_MS = 15_000;
const NO_START = "Listening could not start in this browser. Type your answer instead.";

function joinText(...parts: string[]) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Listens with the Web Speech API: continuous, with interim results. Chrome ends a session on
 * its own after a silence; that silent end restarts listening, and the text heard so far is kept.
 */
export function listenInBrowser(Ctor: RecognitionConstructor, onDevice: boolean, options: ListenOptions): Promise<ListenSession> {
  const recognition = new Ctor();
  recognition.lang = options.lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  if (onDevice) recognition.processLocally = true;

  let earlier = "";
  let current = { text: "", interim: "" };
  let finished = false;
  let started = false;
  let endWaiter: (() => void) | null = null;
  let stopMeter: (() => void) | null = null;

  const heard = () => joinText(earlier, current.text, current.interim).trim();
  const release = () => {
    finished = true;
    stopMeter?.();
    stopMeter = null;
  };

  return new Promise<ListenSession>((resolve, reject) => {
    // Some browsers expose the API but never start (no speech service behind it).
    const startTimer = window.setTimeout(() => {
      if (started) return;
      release();
      recognition.abort();
      reject(new VoiceError(NO_START));
    }, START_TIMEOUT_MS);

    recognition.onstart = () => {
      if (started) return;
      started = true;
      window.clearTimeout(startTimer);
      if (options.onLevel) {
        const onLevel = options.onLevel;
        void startLevelMeter(onLevel).then((stop) => {
          if (finished) stop?.();
          else stopMeter = stop;
        });
      }
      resolve({
        stop() {
          if (finished) return Promise.resolve(heard());
          release();
          return new Promise<string>((done) => {
            const timer = window.setTimeout(() => done(heard()), 1500);
            endWaiter = () => {
              window.clearTimeout(timer);
              done(heard());
            };
            recognition.stop();
          });
        },
        cancel() {
          release();
          recognition.abort();
        },
      });
    };

    recognition.onresult = (event) => {
      current = readResults(event.results);
      options.onPartial(joinText(earlier, current.text), current.interim);
    };

    recognition.onerror = (event) => {
      const message = recognitionErrorMessage(event.error);
      if (!message) return;
      release();
      window.clearTimeout(startTimer);
      if (!started) reject(new VoiceError(message));
      else options.onError?.(message);
    };

    recognition.onend = () => {
      // Words still being guessed when a session ends are kept as said.
      earlier = joinText(earlier, current.text, current.interim);
      current = { text: "", interim: "" };
      if (finished) {
        endWaiter?.();
        return;
      }
      try {
        recognition.start();
      } catch {
        release();
        options.onError?.("Listening stopped. Try again, or type your answer.");
      }
    };

    try {
      recognition.start();
    } catch {
      window.clearTimeout(startTimer);
      reject(new VoiceError(NO_START));
    }
  });
}
