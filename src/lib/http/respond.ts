import { connection } from "next/server";
import { z, ZodError } from "zod";
import { ServiceError } from "@/lib/service/support";

export function errorResponse(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

/** Runs a handler and maps failures to `{ error }` with a fitting status code. */
export async function handle(run: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json(await run());
  } catch (error) {
    if (error instanceof ServiceError) return errorResponse(error.status, error.message);
    if (error instanceof ZodError) {
      const issue = error.issues[0];
      return errorResponse(400, `Invalid input${issue?.path.length ? ` at ${issue.path.join(".")}` : ""}: ${issue?.message ?? "check the request"}`);
    }
    if (error instanceof SyntaxError) return errorResponse(400, "The request body is not valid JSON");
    console.error(error);
    return errorResponse(500, "Something went wrong on our side");
  }
}

export async function readBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  return schema.parse(await request.json());
}

/**
 * Marks a GET handler as request-time only, so it is never prerendered with stale data.
 * Outside Next (in tests) there is no request scope, which is fine.
 */
export async function atRequestTime(): Promise<void> {
  try {
    await connection();
  } catch (error) {
    if (error instanceof Error && error.message.includes("outside a request scope")) return;
    throw error;
  }
}
