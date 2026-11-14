import { tableJoinUrl } from "@/components/table/table-copy";

/** Letters and digits only, so the address cannot carry anything else into the redirect. */
const CODE = /^[A-Za-z0-9]{4,10}$/;

/**
 * The short link a person types from the table screen, `/try/K7M2QX`. It becomes the same link the QR
 * code holds, so a typed visit joins the table and knows it did, exactly like a scanned one.
 */
export async function GET(request: Request, ctx: RouteContext<"/try/[code]">) {
  const { code } = await ctx.params;
  const origin = new URL(request.url).origin;
  const target = CODE.test(code) ? tableJoinUrl(origin, code.toUpperCase()) : new URL("/try", origin).toString();
  return Response.redirect(target, 307);
}
