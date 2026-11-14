import { portfolioLinkRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { setPortfolioLink } from "@/lib/service/sharing";

/** Makes or ends a link to one card or the whole portfolio. The private key is in the body, never the path. */
export async function POST(request: Request) {
  return handle(async () => {
    const { talentId, cardId, on } = await readBody(request, portfolioLinkRequest);
    return setPortfolioLink(talentId, cardId, on);
  });
}
