import { handle } from "@/lib/http/respond";
import { limitRate } from "@/lib/http/request-guard";
import { resetDemo } from "@/lib/service/demo";

export async function POST(request: Request) {
  return handle(async () => {
    limitRate(request);
    return resetDemo();
  });
}
