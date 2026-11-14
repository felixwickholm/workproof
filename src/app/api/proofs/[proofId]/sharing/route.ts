import { sharingRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { setSharing } from "@/lib/service/sharing";

export async function POST(request: Request, ctx: RouteContext<"/api/proofs/[proofId]/sharing">) {
  const { proofId } = await ctx.params;
  return handle(async () => {
    const { talentId, share } = await readBody(request, sharingRequest);
    return setSharing(proofId, talentId, share);
  });
}
