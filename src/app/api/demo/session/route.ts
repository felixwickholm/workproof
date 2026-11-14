import { atRequestTime, handle } from "@/lib/http/respond";
import { getSession } from "@/lib/service/demo";

/** The caller's share code, persona and story stage. The persona key is private to this visitor's sandbox. */
export async function GET() {
  await atRequestTime();
  return handle(getSession);
}
