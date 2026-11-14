import { draftRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { draftChallenge } from "@/lib/service/challenges";

export async function POST(request: Request) {
  return handle(async () => draftChallenge((await readBody(request, draftRequest)).need));
}
