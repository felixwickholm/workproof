import { recommendationRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { recommend } from "@/lib/service/recommendations";

/** A company shares work it scored with another company, only with the person's consent. */
export async function POST(request: Request) {
  return handle(async () => recommend(await readBody(request, recommendationRequest)));
}
