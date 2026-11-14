import { atRequestTime, handle } from "@/lib/http/respond";
import { getCityTask } from "@/lib/service/views";

/** One task for the city: its counts and its leaderboard as labels and totals. Never a name. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await atRequestTime();
  const { id } = await ctx.params;
  return handle(() => getCityTask(id));
}
