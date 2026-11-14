import { onBehalfRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { publishOnBehalf } from "@/lib/service/challenges";

/** The city publishes a challenge for a company, and gets the ready message to send it. */
export async function POST(request: Request) {
  return handle(async () => publishOnBehalf(await readBody(request, onBehalfRequest), (id) => new URL(`/employer/challenges/${encodeURIComponent(id)}`, request.url).href));
}
