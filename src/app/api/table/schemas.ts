import { z } from "zod";
import { LIMITS } from "@/lib/http/limits";
import { ServiceError } from "@/lib/service/support";
import { MAX_SHOWN_NAME, VISITOR_KEY_HEADER } from "@/lib/service/table-rules";

/** The host's invitation: the same length limits as an employer's decision. The two-sentence rule is the service's. */
export const tableInviteRequest = z.object({ host: z.string().max(LIMITS.reviewer), message: z.string().max(LIMITS.feedback) }).strict();

/** The first name the person agrees to show on the big screen. */
export const tableAcceptRequest = z.object({ firstName: z.string().trim().min(1).max(MAX_SHOWN_NAME) }).strict();

/** The visitor's own private key, from its header. Without it nobody can read or answer an invitation. */
export function visitorKey(request: Request): string {
  const key = request.headers.get(VISITOR_KEY_HEADER)?.trim() ?? "";
  if (!key || key.length > 100) throw new ServiceError(403, "Only the person who sent this proof can read or answer its invitation");
  return key;
}
