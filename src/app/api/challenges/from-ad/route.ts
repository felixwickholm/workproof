import { fromAdRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { draftFromAd } from "@/lib/service/challenges";

/** Reads a public job ad (or one of this site's sample ads) and drafts a task from it for a person to approve. */
export async function POST(request: Request) {
  return handle(async () => draftFromAd((await readBody(request, fromAdRequest)).url, new URL(request.url).origin));
}
