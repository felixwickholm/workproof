import { confirmRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { confirmMeeting } from "@/lib/service/meetings";

export async function POST(request: Request, ctx: RouteContext<"/api/meetings/[id]/confirm">) {
  const { id } = await ctx.params;
  return handle(async () => confirmMeeting(id, (await readBody(request, confirmRequest)).side));
}
