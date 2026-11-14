import { handle } from "@/lib/http/respond";
import { acceptMeeting } from "@/lib/service/meetings";

export async function POST(_request: Request, ctx: RouteContext<"/api/meetings/[id]/accept">) {
  const { id } = await ctx.params;
  return handle(() => acceptMeeting(id));
}
