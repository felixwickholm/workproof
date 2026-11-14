import { cacheLife } from "next/cache";
import { buildSeed } from "@/lib/seed";
import { buildLandingData, type LandingData } from "./data";

/**
 * The landing page's data, built on the server from a fresh copy of the demo event (the default
 * "invited" stage that visitors explore). Cached, so the page is part of the static shell and a
 * crawler that runs no JavaScript reads every number and fragment in the first HTML response.
 */
export async function loadLandingData(): Promise<LandingData> {
  "use cache";
  cacheLife("hours");
  const now = new Date();
  return buildLandingData(buildSeed(now, "invited"), now);
}
