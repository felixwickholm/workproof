import { decisionShownRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { setDecisionShown } from "@/lib/service/sharing";

/** Whether the person's links show the decision on one card. */
export async function POST(request: Request) {
  return handle(async () => {
    const { talentId, cardId, shown } = await readBody(request, decisionShownRequest);
    return setDecisionShown(talentId, cardId, shown);
  });
}
