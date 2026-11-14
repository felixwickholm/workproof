import { atRequestTime, handle } from "@/lib/http/respond";
import { ServiceError } from "@/lib/service/support";
import { getRelatedParts } from "@/lib/service/views";

/** Where each skill shows up in the work, found by cue words. No model and no number. */
export async function GET(request: Request, ctx: { params: Promise<{ proofId: string }> }) {
  await atRequestTime();
  const { proofId } = await ctx.params;
  const companyId = new URL(request.url).searchParams.get("companyId");
  return handle(async () => {
    if (!companyId) throw new ServiceError(400, "Say which company is reading");
    return getRelatedParts(proofId, companyId);
  });
}
