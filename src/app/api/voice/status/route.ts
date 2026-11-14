import { atRequestTime, handle } from "@/lib/http/respond";
import { voiceStatus } from "@/lib/voice/server/elevenlabs";

export async function GET() {
  await atRequestTime();
  return handle(async () => voiceStatus(process.env));
}
