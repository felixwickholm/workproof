import { handle } from "@/lib/http/respond";
import { resetDemo } from "@/lib/service/demo";

export async function POST() {
  return handle(resetDemo);
}
