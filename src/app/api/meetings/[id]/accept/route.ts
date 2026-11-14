import { acceptRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { acceptMeeting } from "@/lib/service/meetings";

export async function POST(request: Request, ctx: RouteContext<"/api/meetings/[id]/accept">) {
  const { id } = await ctx.params;
  return handle(async () => acceptMeeting(id, (await readBody(request, acceptRequest)).talentId));
}
