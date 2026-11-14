import { atRequestTime, handle } from "@/lib/http/respond";
import { getSeekerHome } from "@/lib/service/views";

export async function GET(_request: Request, ctx: RouteContext<"/api/seeker/[talentId]/home">) {
  await atRequestTime();
  const { talentId } = await ctx.params;
  return handle(() => getSeekerHome(talentId));
}
