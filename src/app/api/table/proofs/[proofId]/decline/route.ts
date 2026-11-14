import { limitRate } from "@/lib/http/request-guard";
import { handle } from "@/lib/http/respond";
import { declineTableInvite } from "@/lib/service/table";
import { visitorKey } from "../../../schemas";

/** The author says not now. No body: nothing about the person is sent or stored. */
export async function POST(request: Request, ctx: RouteContext<"/api/table/proofs/[proofId]/decline">) {
  const { proofId } = await ctx.params;
  return handle(async () => {
    limitRate(request);
    return declineTableInvite(proofId, visitorKey(request));
  });
}
