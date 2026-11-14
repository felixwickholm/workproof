import { handle } from "@/lib/http/respond";
import { limitDemoRebuilds, readLimitedText } from "@/lib/http/request-guard";
import { storyRequest } from "@/lib/http/schemas";
import { setStoryStage } from "@/lib/service/demo";

/** Rebuilds the caller's sandbox at a story stage. Has its own rate count, so a walkthrough is never blocked. */
export async function POST(request: Request) {
  return handle(async () => {
    limitDemoRebuilds(request);
    const { stage } = storyRequest.parse(JSON.parse(await readLimitedText(request)));
    return setStoryStage(stage);
  });
}
