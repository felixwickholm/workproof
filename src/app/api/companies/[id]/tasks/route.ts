import { atRequestTime, handle } from "@/lib/http/respond";
import { getCompanyTasks } from "@/lib/service/views";

/** The company's tasks with their counts and top human total. */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  await atRequestTime();
  const { id } = await ctx.params;
  return handle(() => getCompanyTasks(id));
}
