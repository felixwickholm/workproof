import { placesOf } from "@/lib/domain/places";

/** At or below this many places left, the line turns from grey to ink: the task is filling up. */
const FEW_PLACES = 3;

export interface PlacesState {
  /** "7 of 12 places left", "1 of 12 places left", "Full". */
  text: string;
  /** Few places left: say it in ink. */
  few: boolean;
  full: boolean;
}

/** How full a task is, in words, or null for a practice task, which has no limit. */
export function placesState(challenge: { kind: "event" | "taster"; places?: number }, left: number): PlacesState | null {
  const places = placesOf(challenge);
  if (places === null) return null;
  if (left <= 0) return { text: "Full", few: true, full: true };
  return { text: `${left} of ${places} ${places === 1 ? "place" : "places"} left`, few: left <= FEW_PLACES, full: false };
}

/** Why Start is off on a full task. Honest: there is no waiting list. */
export function fullReason(challenge: { kind: "event" | "taster"; places?: number }): string {
  return `This task has all its ${placesOf(challenge) ?? 0} answers, so every one can be read. Choose another task.`;
}
