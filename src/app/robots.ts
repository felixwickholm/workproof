import type { MetadataRoute } from "next";
import { siteUrl } from "./for-judges/site";

/** Every crawler may read every page; the sitemap lists the public ones. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
