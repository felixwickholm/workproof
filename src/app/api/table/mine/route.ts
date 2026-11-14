import { atRequestTime, handle } from "@/lib/http/respond";
import { ServiceError } from "@/lib/service/support";
import { myTableInvite } from "@/lib/service/table";
import { visitorKey } from "../schemas";

/** The invitation for one of the visitor's own practice proofs, read with their key. The phone asks every 2 s. */
export async function GET(request: Request) {
  await atRequestTime();
  return handle(async () => {
    const proofId = new URL(request.url).searchParams.get("proofId");
    if (!proofId) throw new ServiceError(400, "Say which proof: ?proofId=");
    return myTableInvite(proofId, visitorKey(request));
  });
}
