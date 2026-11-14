import { atRequestTime, handle } from "@/lib/http/respond";
import { getSharedPortfolio } from "@/lib/service/views";

/** What one shared link shows: the work and the written answers, never a name, contact or key. */
export async function GET(_request: Request, ctx: RouteContext<"/api/portfolio/shared/[token]">) {
  await atRequestTime();
  const { token } = await ctx.params;
  return handle(() => getSharedPortfolio(token));
}
