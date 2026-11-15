import type { MetadataRoute } from "next";
import { SAMPLE_AD_PATHS } from "@/lib/seed/ads";
import { VERIFIED_ON } from "./for-judges/evidence";
import { ROUTES } from "./for-judges/facts";
import { siteUrl } from "./for-judges/site";

/** Public pages besides the product routes: the explainer, the sample job ads, the two text maps and the submission data. */
export const EXTRA_PATHS: readonly string[] = ["/how-it-works", ...SAMPLE_AD_PATHS, "/llms.txt", "/llms-full.txt", "/submission.json"];

/** The public pages, from the same list /for-judges and /llms.txt use. */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  return [...ROUTES.map((r) => r.path), ...EXTRA_PATHS].map((path) => ({
    url: `${site}${path === "/" ? "" : path}`,
    lastModified: VERIFIED_ON,
    priority: path === "/" || path === "/for-judges" ? 1 : 0.5,
  }));
}
