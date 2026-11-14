/**
 * The public address of the deployed demo, for the sitemap, robots and structured data.
 * Set `SITE_URL` (for example https://workproof.example.org) when deploying; without it, links
 * point at the local dev server.
 */
export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
