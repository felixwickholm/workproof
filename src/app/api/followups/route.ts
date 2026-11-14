import { followUpRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { followUpsFor } from "@/lib/service/challenges";

export async function POST(request: Request) {
  return handle(async () => {
    const { challengeId, answer } = await readBody(request, followUpRequest);
    return { questions: await followUpsFor(challengeId, answer) };
  });
}
