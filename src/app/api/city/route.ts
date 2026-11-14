import { atRequestTime, handle } from "@/lib/http/respond";
import { getCityOverview } from "@/lib/service/views";

export async function GET() {
  await atRequestTime();
  return handle(getCityOverview);
}
