import { cacheLife } from "next/cache";
import { buildSeed } from "@/lib/seed";
import { buildHowItWorksData, type HowItWorksData } from "./data";

/**
 * The how-it-works page's data, built on the server from a fresh copy of the demo event (the default
 * "invited" stage that visitors explore). Cached, so the page is part of the static shell and a
 * crawler that runs no JavaScript reads every number and fragment in the first HTML response.
 */
export async function loadHowItWorksData(): Promise<HowItWorksData> {
  "use cache";
  cacheLife("hours");
  const now = new Date();
  return buildHowItWorksData(buildSeed(now, "invited"), now);
}
