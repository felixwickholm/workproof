import { atRequestTime, handle } from "@/lib/http/respond";
import { getTableProofs } from "@/lib/service/views";

export async function GET() {
  await atRequestTime();
  return handle(() => getTableProofs());
}
