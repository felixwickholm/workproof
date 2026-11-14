import { handle } from "@/lib/http/respond";
import { limitDemoRebuilds } from "@/lib/http/request-guard";
import { resetDemo } from "@/lib/service/demo";

/** Resets only the caller's sandbox. Has its own rate count, so a walkthrough is never blocked. */
export async function POST(request: Request) {
  return handle(async () => {
    limitDemoRebuilds(request);
    return resetDemo();
  });
}
