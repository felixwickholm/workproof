import { atRequestTime, handle } from "@/lib/http/respond";
import { talentKey } from "@/lib/http/talent-key";
import { getPassport } from "@/lib/service/views";

/** The person's own proofs. The private key comes in the `x-workprint-key` header, never in the path. */
export async function GET(request: Request) {
  await atRequestTime();
  return handle(() => getPassport(talentKey(request)));
}
