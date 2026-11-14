import type { RedactionReport } from "@/lib/domain/types";

const WORDS: Record<keyof RedactionReport, [string, string]> = {
  names: ["name", "names"],
  contacts: ["contact detail", "contact details"],
  places: ["place", "places"],
  schools: ["school", "schools"],
  employers: ["employer", "employers"],
  other: ["other detail", "other details"],
};

/** "1 name, 3 places, 1 school": what the blind layer hid, by kind. Only the author sees this. */
export function hiddenByKind(report: RedactionReport): string {
  return (Object.keys(WORDS) as (keyof RedactionReport)[])
    .filter((key) => report[key] > 0)
    .map((key) => `${report[key]} ${WORDS[key][report[key] === 1 ? 0 : 1]}`)
    .join(", ");
}
