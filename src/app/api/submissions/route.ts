import { MAX_SUBMISSION_BODY_BYTES } from "@/lib/http/limits";
import { submissionRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { submitWork } from "@/lib/service/submissions";

/** The one route with a larger body: a submission may carry one picture of the work. */
export async function POST(request: Request) {
  return handle(async () => ({ proof: await submitWork(await readBody(request, submissionRequest, MAX_SUBMISSION_BODY_BYTES)) }));
}
