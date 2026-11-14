import { atRequestTime, handle } from "@/lib/http/respond";
import { getChallenge } from "@/lib/service/challenges";

export async function GET(_request: Request, ctx: RouteContext<"/api/challenges/[id]">) {
  await atRequestTime();
  const { id } = await ctx.params;
  return handle(() => getChallenge(id));
}
