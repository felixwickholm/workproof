import { atRequestTime, handle } from "@/lib/http/respond";
import { cityActions } from "@/lib/service/city-actions";

/** What the organiser can act on in the caller's own event: reminders to draft and the event's rules. */
export async function GET() {
  await atRequestTime();
  return handle(cityActions);
}
