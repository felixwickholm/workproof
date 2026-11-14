import { atRequestTime, handle } from "@/lib/http/respond";
import { talentKey } from "@/lib/http/talent-key";
import { getSeekerHome } from "@/lib/service/views";

/** The person's own home. The private key comes in the `x-workproof-key` header, never in the path. */
export async function GET(request: Request) {
  await atRequestTime();
  return handle(() => getSeekerHome(talentKey(request)));
}
