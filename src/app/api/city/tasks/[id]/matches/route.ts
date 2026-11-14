import { atRequestTime, handle } from "@/lib/http/respond";
import { getShareMatches } from "@/lib/service/views";

/** Companies that may receive a proof from this task: a challenge sharing at least two core skills. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await atRequestTime();
  const { id } = await ctx.params;
  return handle(() => getShareMatches(id));
}
