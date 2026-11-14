import type { MetadataRoute } from "next";
import { siteUrl } from "./for-judges/site";

/** AI crawlers named one by one, so a rule written for one of them can never block it by accident. */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
] as const;

/** Every crawler may read every page; the sitemap lists the public ones. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: [...AI_CRAWLERS], allow: "/" },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
