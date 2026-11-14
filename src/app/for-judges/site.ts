/** The public address of the live demo. */
export const LIVE_SITE = "https://workproof.wicflow.com";

/** The public source repository. */
export const DEFAULT_REPO = "https://github.com/felixwickholm/workproof";

/**
 * The public address of the deployed demo, for the sitemap, robots, structured data and /llms.txt.
 * `SITE_URL` sets it. Without it, a production build points at the live demo, because robots, the
 * sitemap and the text maps are prerendered at build time, and a development server points at itself.
 */
export function siteUrl(): string {
  const fallback = process.env.NODE_ENV === "production" ? LIVE_SITE : "http://localhost:3000";
  return (process.env.SITE_URL || fallback).replace(/\/$/, "");
}

/** The source repository that /llms.txt and the structured data link to. `REPO_URL` overrides it. */
export function repoUrl(): string {
  return (process.env.REPO_URL || DEFAULT_REPO).replace(/\/$/, "");
}

/** The plain-text maps of the site, linked from every page head as alternate versions. */
export const TEXT_MAPS = {
  "text/plain": [
    { url: "/llms.txt", title: "WorkProof: short map" },
    { url: "/llms-full.txt", title: "WorkProof: full text" },
  ],
};
