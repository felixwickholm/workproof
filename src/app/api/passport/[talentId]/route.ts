import { atRequestTime, handle } from "@/lib/http/respond";
import { getPassport } from "@/lib/service/views";

export async function GET(_request: Request, ctx: RouteContext<"/api/passport/[talentId]">) {
  await atRequestTime();
  const { talentId } = await ctx.params;
  return handle(() => getPassport(talentId));
}
