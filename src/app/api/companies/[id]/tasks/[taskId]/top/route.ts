import { atRequestTime, handle } from "@/lib/http/respond";
import { getTopProofs } from "@/lib/service/views";

/** The leaderboard for one of the company's tasks: scored proofs by human total, then the unscored ones. Blind. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string; taskId: string }> }) {
  await atRequestTime();
  const { id, taskId } = await ctx.params;
  return handle(() => getTopProofs(id, taskId));
}
