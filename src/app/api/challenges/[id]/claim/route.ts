import { companyRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { claimChallenge } from "@/lib/service/challenges";

/** The company opens a challenge the city made for it. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(async () => claimChallenge(id, (await readBody(request, companyRequest)).companyId));
}
