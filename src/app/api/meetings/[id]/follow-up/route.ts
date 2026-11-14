import { followUpAgreedRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { recordFollowUp } from "@/lib/service/meetings";

/** The company records whether a follow-up was agreed after the talk. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(async () => {
    const { companyId, agreed } = await readBody(request, followUpAgreedRequest);
    return recordFollowUp(id, companyId, agreed);
  });
}
