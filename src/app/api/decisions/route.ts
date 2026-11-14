import { decisionRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { decide } from "@/lib/service/decisions";

export async function POST(request: Request) {
  return handle(async () => decide(await readBody(request, decisionRequest)));
}
