import { companyRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { recordHire } from "@/lib/service/meetings";

/** The company records a hire after a talk both sides confirmed. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(async () => recordHire(id, (await readBody(request, companyRequest)).companyId));
}
