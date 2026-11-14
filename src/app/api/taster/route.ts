import { tasterRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { createTaster } from "@/lib/service/challenges";

export async function POST(request: Request) {
  return handle(async () => createTaster((await readBody(request, tasterRequest)).dreamJob));
}
