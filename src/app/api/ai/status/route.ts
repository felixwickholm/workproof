import { aiStatus } from "@/lib/ai";
import { atRequestTime, handle } from "@/lib/http/respond";

/** Which designer drafts tasks, for the badge. Provider and model name only, never a key. */
export async function GET() {
  await atRequestTime();
  return handle(async () => aiStatus());
}
