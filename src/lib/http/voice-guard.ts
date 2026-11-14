import { ServiceError } from "@/lib/service/support";
import { NO_SANDBOX_MESSAGE, sandboxes } from "@/lib/store";
import { VOICE_RATE } from "@/lib/voice/server/elevenlabs";
import { VOICE_CALLS_PER_MINUTE_ALL } from "./limits";
import { callerSandbox, limitAllCallers, limitRate, type RateBucket } from "./request-guard";

const VOICE_ALL: RateBucket = { name: "voice-all", perMinute: VOICE_CALLS_PER_MINUTE_ALL };

/**
 * The checks before a call to the paid voice service: the caller must have visited the site (a live sandbox,
 * not just a well-formed cookie), stays within their own count, and all callers together stay within one ceiling.
 */
export function guardVoice(request: Request, now = Date.now()): void {
  const id = callerSandbox(request);
  if (!id || !sandboxes().find(id, now)) throw new ServiceError(401, NO_SANDBOX_MESSAGE);
  limitRate(request, now, VOICE_RATE);
  limitAllCallers(VOICE_ALL, now);
}
