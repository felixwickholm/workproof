import { ServiceError } from "@/lib/service/support";
import { VISITOR_KEY_HEADER } from "@/lib/service/table-rules";

/** The longest private key a request may carry; real keys are much shorter. */
const MAX_KEY_LENGTH = 100;

/**
 * The person's private key from the `x-workprint-key` header. A header, not the path, so the key never
 * lands in an access log, a referrer or the browser history. Errors never repeat the key.
 */
export function talentKey(request: Request): string {
  const key = request.headers.get(VISITOR_KEY_HEADER)?.trim() ?? "";
  if (!key || key.length > MAX_KEY_LENGTH) throw new ServiceError(401, "Open your own page first.");
  return key;
}
