import { approveRequest } from "@/lib/http/schemas";
import { atRequestTime, handle, readBody } from "@/lib/http/respond";
import { approveChallenge, listChallenges } from "@/lib/service/challenges";

export async function GET() {
  await atRequestTime();
  return handle(listChallenges);
}

export async function POST(request: Request) {
  return handle(async () => approveChallenge(await readBody(request, approveRequest)));
}
