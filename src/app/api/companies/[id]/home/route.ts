import { atRequestTime, handle } from "@/lib/http/respond";
import { getEmployerHome } from "@/lib/service/views";

export async function GET(_request: Request, ctx: RouteContext<"/api/companies/[id]/home">) {
  await atRequestTime();
  const { id } = await ctx.params;
  return handle(() => getEmployerHome(id));
}
