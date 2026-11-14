import { declineRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { declineMeeting } from "@/lib/service/meetings";

/** The invited person says no. Their name is never shown to the company. */
export async function POST(request: Request, ctx: RouteContext<"/api/meetings/[id]/decline">) {
  const { id } = await ctx.params;
  return handle(async () => declineMeeting(id, (await readBody(request, declineRequest)).talentId));
}
