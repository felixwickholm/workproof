import { atRequestTime } from "@/lib/http/respond";
import { meetingsCsv } from "@/lib/service/city-actions";
import { getStore } from "@/lib/store";

/** The caller's own event as a meeting list for the event's meeting tool. Names only after the person accepted. */
export async function GET() {
  await atRequestTime();
  return new Response(meetingsCsv(await getStore().read()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="workprint-meetings.csv"',
      "Cache-Control": "no-store",
    },
  });
}
