import { repoUrl, siteUrl } from "@/app/for-judges/site";
import { buildSubmission } from "./build";

/** The entry as JSON, from the same facts and measured figures as /for-judges and /llms.txt. */
export function GET() {
  return Response.json(buildSubmission(siteUrl(), repoUrl()));
}
