import { STORY_PROOF } from "./steps";
import { STORY_PROOF_SEED } from "./story-ids";

/** Puts the proof id into a step's route. Null when the route needs one and there is none. */
export function fillRoute(route: string, proofId: string | null): string | null {
  if (!route.includes(STORY_PROOF)) return route;
  return proofId ? route.replace(STORY_PROOF, encodeURIComponent(proofId)) : null;
}

/** The real path for a step: the story proof keeps its seed id at every story stage. */
export function resolveRoute(route: string): string | null {
  return fillRoute(route, STORY_PROOF_SEED);
}
