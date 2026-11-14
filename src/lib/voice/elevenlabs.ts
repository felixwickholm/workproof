import { meterStream } from "./level";
import { VOICE_LIMITS } from "./limits";
import { speakInBrowser, stopBrowserSpeech } from "./synthesis";
import { VoiceError, type ListenOptions, type ListenSession, type VoiceAdapter, type VoiceStatus } from "./types";

const AUDIO_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

/** About 480 KB a minute, so the longest take stays under the server's size cap. */
const BITS_PER_SECOND = 64_000;

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string") return body.error;
  } catch {
    // The body was not JSON; the plain message below covers it.
  }
  return "The text could not be made. Try again, or type your answer.";
}

async function record(options: ListenOptions): Promise<ListenSession> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    throw new VoiceError("The microphone is not allowed. Allow it in the browser settings, or type your answer.");
  }
  const mimeType = AUDIO_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: BITS_PER_SECOND });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const stopMeter = options.onLevel ? meterStream(stream, options.onLevel) : null;
  const release = () => {
    stopMeter?.();
    for (const track of stream.getTracks()) track.stop();
  };
  recorder.start();

  return {
    async stop() {
      const ended = new Promise<void>((resolve) => recorder.addEventListener("stop", () => resolve(), { once: true }));
      recorder.stop();
      await ended;
      release();
      const audio = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (audio.size > VOICE_LIMITS.audioBytes) throw new VoiceError("That take is too long. Record a shorter answer, or type it.");
      const language = options.lang.split("-")[0];
      const response = await fetch(`/api/voice/transcribe?lang=${encodeURIComponent(language)}`, {
        method: "POST",
        headers: { "content-type": audio.type },
        body: audio,
      });
      if (!response.ok) throw new VoiceError(await readError(response));
      const { text } = (await response.json()) as { text: string };
      return text;
    },
    cancel() {
      if (recorder.state !== "inactive") recorder.stop();
      release();
    },
  };
}

/**
 * The server voice service. Audio is recorded here, sent once to the server, which turns it into
 * text and keeps nothing. Speaking falls back to the browser's voices if the server cannot.
 */
export function createElevenLabsAdapter(lang: string, status: VoiceStatus): VoiceAdapter {
  const canBrowserSpeak = typeof window.speechSynthesis !== "undefined";
  let playing: HTMLAudioElement | null = null;

  const stopSpeaking = () => {
    playing?.pause();
    playing = null;
    stopBrowserSpeech();
  };

  async function speakOnServer(text: string): Promise<void> {
    const response = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, VOICE_LIMITS.speakChars) }),
    });
    if (!response.ok) throw new VoiceError(await readError(response));
    const url = URL.createObjectURL(await response.blob());
    const audio = new Audio(url);
    playing = audio;
    try {
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.onpause = () => resolve();
        void audio.play().catch(() => resolve());
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return {
    name: "elevenlabs",
    canListen: true,
    canSpeak: status.tts || canBrowserSpeak,
    privacy: "server-once",
    listen: record,
    async speak(text, options) {
      stopSpeaking();
      const speakLang = options?.lang ?? lang;
      if (status.tts) {
        try {
          return await speakOnServer(text);
        } catch {
          // The question is on screen as text, so the browser voice is a fair second choice.
        }
      }
      if (canBrowserSpeak) await speakInBrowser(text, speakLang);
    },
    stopSpeaking,
  };
}
