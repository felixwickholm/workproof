import { handle, readBody } from "@/lib/http/respond";
import { inviteFromTable } from "@/lib/service/table";
import { tableInviteRequest } from "../../../schemas";

/** The person hosting the table invites the author of one practice proof. */
export async function POST(request: Request, ctx: RouteContext<"/api/table/proofs/[proofId]/invite">) {
  const { proofId } = await ctx.params;
  return handle(async () => inviteFromTable(proofId, await readBody(request, tableInviteRequest)));
}
