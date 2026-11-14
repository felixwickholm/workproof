import { reviewerRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { addReviewer } from "@/lib/service/reviewers";

/** "Add me as a reviewer for {company}": the explicit step that lets a new person decide. */
export async function POST(request: Request, ctx: RouteContext<"/api/companies/[id]/reviewers">) {
  return handle(async () => {
    const { id } = await ctx.params;
    const { name } = await readBody(request, reviewerRequest);
    return addReviewer(id, name);
  });
}
