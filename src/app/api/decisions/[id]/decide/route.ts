import { decideHoldRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { decideHold } from "@/lib/service/decisions";

/** Turns a scored hold into meet or pass. A meeting is created only on meet. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(async () => decideHold(id, await readBody(request, decideHoldRequest)));
}
