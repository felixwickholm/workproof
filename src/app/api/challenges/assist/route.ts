import { assistRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { assist } from "@/lib/service/assist";

/** One turn of the company's "new challenge" chat: a short question, or a draft to edit and approve. */
export async function POST(request: Request) {
  return handle(async () => assist((await readBody(request, assistRequest)).messages));
}
