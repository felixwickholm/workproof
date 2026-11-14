const eventDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
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

/** "2026-11-14" as "Sat 14", for a short axis label. */
export function formatDayLabel(day: string) {
  const parsed = noonOf(day);
  return Number.isNaN(parsed.getTime()) ? day : `${weekday.format(parsed)} ${parsed.getDate()}`;
}

/** Hours as a short duration: "45 min", "3 h", "2.5 h", "3 days". Null is "Not yet". */
export function formatHours(hours: number | null) {
  if (hours === null) return "Not yet";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours * 10) / 10} h`;
  return `${Math.round(hours / 24)} days`;
}

/** An ISO timestamp as the event's wall-clock time, "09:42" (Espoo time). */
export function formatClock(iso: string) {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "" : clock.format(parsed);
}

/** A whole number of days: "1 day", "4 days". */
export function formatDays(days: number) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/** A count and its noun: "1 proof", "3 proofs". */
export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
