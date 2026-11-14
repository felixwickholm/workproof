import type { MetadataRoute } from "next";
import { ROUTES } from "./for-judges/facts";
import { siteUrl } from "./for-judges/site";

/** The public pages, from the same list /for-judges and /llms.txt use, plus /how-it-works and /llms.txt itself. */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = siteUrl();
  return [...ROUTES.map((r) => r.path), "/how-it-works", "/llms.txt"].map((path) => ({ url: `${site}${path === "/" ? "" : path}` }));
}
