import { handle } from "@/lib/http/respond";
import { guardVoice } from "@/lib/http/voice-guard";
import { readAudioBody, transcribe } from "@/lib/voice/server/elevenlabs";

/** Turns one recorded answer into text. The audio is passed through once and never stored. */
export async function POST(request: Request) {
  return handle(async () => {
    guardVoice(request);
    const audio = await readAudioBody(request);
    const language = new URL(request.url).searchParams.get("lang") ?? undefined;
    return transcribe(audio, language, { env: process.env, fetch });
  });
}
