/**
 * Places on a task: an event task takes a fixed number of answers, so a person at the company
 * can read every one of them and write back. Practice tasks have no limit; no company reads them.
 */

/** The places a task gets when the employer does not choose. */
export const DEFAULT_PLACES = 12;
/** The range an employer can choose from when publishing. */
export const MIN_PLACES = 5;
export const MAX_PLACES = 30;

/** Reading one proof and writing a short answer takes about this long. An estimate, stated as one. */
const READING_MINUTES_PER_PROOF = 4;

/** Clamps a requested number of places to the allowed range, or gives the default. */
export function choosePlaces(requested?: number): number {
  if (requested === undefined || !Number.isFinite(requested)) return DEFAULT_PLACES;
  return Math.min(MAX_PLACES, Math.max(MIN_PLACES, Math.round(requested)));
}

/** The places of a task, or null for a practice task, which takes any number of answers. */
export function placesOf(challenge: { kind: "event" | "taster"; places?: number }): number | null {
  return challenge.kind === "taster" ? null : choosePlaces(challenge.places);
}

/** Places still open after `taken` answers; never below zero. Null for a practice task. */
export function placesLeft(challenge: { kind: "event" | "taster"; places?: number }, taken: number): number | null {
  const places = placesOf(challenge);
  return places === null ? null : Math.max(0, places - taken);
}

/** The honest refusal once a task has all its answers. There is no waiting list. */
export function fullTaskMessage(places: number): string {
  return `This task has all its ${places} answers. Choose another task.`;
}

/** About how many minutes of reading `waiting` proofs take. */
export function readingMinutes(waiting: number): number {
  return Math.max(0, waiting) * READING_MINUTES_PER_PROOF;
}
