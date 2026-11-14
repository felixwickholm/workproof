import { followUpRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { issueFollowUps } from "@/lib/service/follow-ups";

/** Writes and records the follow-up questions for one answer. The submission must name `issueId` and answer exactly these. */
export async function POST(request: Request) {
  return handle(async () => {
    const { challengeId, answer, talent } = await readBody(request, followUpRequest);
    return issueFollowUps(challengeId, answer, talent);
  });
}
