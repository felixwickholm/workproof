import type { RateBucket } from "@/lib/http/request-guard";
import { ServiceError } from "@/lib/service/support";
import { VOICE_LIMITS } from "../limits";
import type { VoiceStatus } from "../types";

/** Each voice call costs money upstream, so it gets its own, smaller allowance per address. */
export const VOICE_RATE: RateBucket = { name: "voice", perMinute: 20 };

const API = "https://api.elevenlabs.io/v1";
/** ElevenLabs' default multilingual speech model and its speech-to-text model (docs, Nov 2026). */
const TTS_MODEL = "eleven_multilingual_v2";
const STT_MODEL = "scribe_v2";
/** A calm premade voice that ElevenLabs' own examples use. `ELEVENLABS_VOICE_ID` replaces it. */
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

type Env = Record<string, string | undefined>;

interface VoiceServerDeps {
  env: Env;
  fetch: typeof fetch;
}

const NOT_SET_UP = "No server voice service is set up. The browser's own voice is used instead.";
const UPSTREAM_FAILED = "The voice service did not answer. Try again, or type your answer.";

function apiKey(env: Env): string {
  const key = env.ELEVENLABS_API_KEY?.trim();
  if (!key) throw new ServiceError(503, NOT_SET_UP);
  return key;
}

/** Which voice service runs. Says only whether a key exists, never the key. */
export function voiceStatus(env: Env): VoiceStatus {
  const ready = Boolean(env.ELEVENLABS_API_KEY?.trim());
  return { provider: ready ? "elevenlabs" : "browser", tts: ready, stt: ready };
}

/** Text to speech. Resolves with ElevenLabs' MP3 stream, ready to pass straight to the browser. */
export async function synthesize(text: string, { env, fetch }: VoiceServerDeps): Promise<ReadableStream<Uint8Array>> {
  const key = apiKey(env);
  const spoken = text.trim();
  if (!spoken) throw new ServiceError(400, "There is no text to read aloud.");
  if (spoken.length > VOICE_LIMITS.speakChars) throw new ServiceError(413, `Text to read aloud is limited to ${VOICE_LIMITS.speakChars} characters.`);
  const voiceId = env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const response = await fetch(`${API}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text: spoken, model_id: TTS_MODEL }),
  });
  if (!response.ok || !response.body) throw new ServiceError(502, UPSTREAM_FAILED);
  return response.body;
}

/**
 * Speech to text. The audio is passed through once and never stored; only the text comes back.
 * `language` is an ISO 639-1 code such as "en"; without it the service detects the language.
 */
export async function transcribe(audio: Blob, language: string | undefined, { env, fetch }: VoiceServerDeps): Promise<{ text: string }> {
  const key = apiKey(env);
  if (audio.size === 0) throw new ServiceError(400, "The recording is empty. Try again, or type your answer.");
  if (audio.size > VOICE_LIMITS.audioBytes) throw new ServiceError(413, "The recording is too long. Keep it under a minute.");
  const form = new FormData();
  form.append("model_id", STT_MODEL);
  form.append("file", audio, "answer");
  if (language && /^[a-z]{2,3}$/.test(language)) form.append("language_code", language);
  const response = await fetch(`${API}/speech-to-text`, { method: "POST", headers: { "xi-api-key": key }, body: form });
  if (!response.ok) throw new ServiceError(502, UPSTREAM_FAILED);
  const body = (await response.json()) as { text?: unknown };
  if (typeof body.text !== "string") throw new ServiceError(502, UPSTREAM_FAILED);
  return { text: body.text.trim() };
}

/** Reads a request body as bytes and stops at `max`, whatever the content-length header says. */
export async function readAudioBody(request: Request, max = VOICE_LIMITS.audioBytes): Promise<Blob> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.startsWith("audio/")) throw new ServiceError(415, "Send the recording as audio.");
  const tooLarge = () => new ServiceError(413, "The recording is too long. Keep it under a minute.");
  if (Number(request.headers.get("content-length") ?? 0) > max) throw tooLarge();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  if (request.body) {
    const reader = request.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw tooLarge();
      }
      chunks.push(value);
    }
  }
  return new Blob(chunks, { type });
}
