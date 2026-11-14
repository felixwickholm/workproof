import { api } from "@/lib/client/api";
import type { PassportEntry } from "@/lib/domain/types";
import { STORY_PROOF } from "./steps";

/** Olena's story proof is the newest entry in her passport (the passport lists newest first). */
export function storyProofId(passport: PassportEntry[]): string | null {
  return passport[0]?.proof.proofId ?? null;
}

/** Puts the proof id into a step's route. Null when the route needs one and there is none. */
export function fillRoute(route: string, proofId: string | null): string | null {
  if (!route.includes(STORY_PROOF)) return route;
  return proofId ? route.replace(STORY_PROOF, encodeURIComponent(proofId)) : null;
}

/**
 * The real path for a step, read after its stage is set: the persona gets a new key on every
 * rebuild, so the story proof is looked up fresh from the persona's home.
 */
export async function resolveRoute(route: string): Promise<string | null> {
  if (!route.includes(STORY_PROOF)) return route;
  const session = await api.demoSession();
  const home = await api.seekerHome(session.persona.talentId);
  return fillRoute(route, storyProofId(home.passport));
}
