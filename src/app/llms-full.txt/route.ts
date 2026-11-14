import { repoUrl, siteUrl } from "@/app/for-judges/site";
import { buildLlmsFullTxt } from "./build";

/** The whole evidence page as plain markdown, from the same facts as /for-judges and /llms.txt. */
export function GET() {
  return new Response(buildLlmsFullTxt(siteUrl(), repoUrl()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
