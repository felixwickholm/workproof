const eventDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Helsinki" });

/** Noon on an ISO day, so the weekday never shifts with the visitor's time zone. */
function noonOf(day: string) {
  return new Date(`${day}T12:00:00`);
}

/** "2026-11-14" as "Saturday 14 November 2026". */
export function formatEventDate(date: string) {
  const parsed = noonOf(date);
  if (Number.isNaN(parsed.getTime())) return date;
  // Intl puts a comma after the weekday in en-GB; the copy writes the date without one.
  return eventDate
    .formatToParts(parsed)
    .filter((part) => part.type !== "literal")
    .map((part) => part.value)
    .join(" ");
}

/** An ISO timestamp as the event's wall-clock time, "09:42" (Espoo time). */
export function formatClock(iso: string) {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "" : clock.format(parsed);
}
