import type { Challenge } from "@/lib/domain/types";

/** What talent may read of a challenge. The set-aside list holds the company's own wishes, so it stays company-side. */
export function forTalent(challenge: Challenge): Challenge {
  return { ...challenge, setAside: [] };
}
