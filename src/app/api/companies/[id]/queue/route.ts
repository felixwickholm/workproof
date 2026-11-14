import { atRequestTime, handle } from "@/lib/http/respond";
import { getQueue } from "@/lib/service/views";

export async function GET(_request: Request, ctx: RouteContext<"/api/companies/[id]/queue">) {
  await atRequestTime();
  const { id } = await ctx.params;
  return handle(() => getQueue(id));
}
