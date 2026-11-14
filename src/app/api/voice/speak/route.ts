import { z } from "zod";
import { handle, readBody } from "@/lib/http/respond";
import { guardVoice } from "@/lib/http/voice-guard";
import { VOICE_LIMITS } from "@/lib/voice/limits";
import { synthesize } from "@/lib/voice/server/elevenlabs";

const speakRequest = z.object({ text: z.string().trim().min(1).max(VOICE_LIMITS.speakChars) });

/** Reads text aloud with the server voice service. 503 when none is set up; the browser voice is used then. */
export async function POST(request: Request) {
  try {
    guardVoice(request);
    const { text } = await readBody(request, speakRequest);
    const audio = await synthesize(text, { env: process.env, fetch });
    return new Response(audio, { headers: { "content-type": "audio/mpeg", "cache-control": "no-store" } });
  } catch (error) {
    // The same `{ error }` shape and status codes as every other route.
    return handle(() => Promise.reject(error));
  }
}
