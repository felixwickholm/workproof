import { handle, readBody } from "@/lib/http/respond";
import { acceptTableInvite } from "@/lib/service/table";
import { tableAcceptRequest, visitorKey } from "../../../schemas";

/** The author accepts with the first name they want shown. Their own key comes in a header. */
export async function POST(request: Request, ctx: RouteContext<"/api/table/proofs/[proofId]/accept">) {
  const { proofId } = await ctx.params;
  return handle(async () => {
    const key = visitorKey(request);
    const { firstName } = await readBody(request, tableAcceptRequest);
    return acceptTableInvite(proofId, key, firstName);
  });
}
