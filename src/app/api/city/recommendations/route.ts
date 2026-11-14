import { cityRecommendationRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { recommendForCity } from "@/lib/service/recommendations";

/** The city shares a scored proof with another company, only with the person's consent. */
export async function POST(request: Request) {
  return handle(async () => recommendForCity(await readBody(request, cityRecommendationRequest)));
}
