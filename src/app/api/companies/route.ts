import { atRequestTime, handle } from "@/lib/http/respond";
import { listCompanies } from "@/lib/service/views";

export async function GET() {
  await atRequestTime();
  return handle(listCompanies);
}
