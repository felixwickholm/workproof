import { submissionRequest } from "@/lib/http/schemas";
import { handle, readBody } from "@/lib/http/respond";
import { submitWork } from "@/lib/service/submissions";

export async function POST(request: Request) {
  return handle(async () => ({ proof: await submitWork(await readBody(request, submissionRequest)) }));
}
