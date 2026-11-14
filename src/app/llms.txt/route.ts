import { repoUrl, siteUrl } from "@/app/for-judges/site";
import { buildLlmsTxt } from "./build";

/** A plain-text map of the project for language models, from the same facts as /for-judges. */
export function GET() {
  return new Response(buildLlmsTxt(siteUrl(), repoUrl()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
