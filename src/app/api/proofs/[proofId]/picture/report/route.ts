import { pictureReportRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { reportPicture } from "@/lib/service/pictures";

/** A reviewer reports a picture as possibly identifying: it is removed from the blind proof for everyone. */
export async function POST(request: Request, ctx: RouteContext<"/api/proofs/[proofId]/picture/report">) {
  const { proofId } = await ctx.params;
  return handle(async () => {
    const { companyId, reviewer } = await readBody(request, pictureReportRequest);
    return reportPicture(proofId, companyId, reviewer);
  });
}
