import type { PassportEntry } from "@/lib/domain/types";
import { totalOutOf } from "../words";

type Entry = Pick<PassportEntry, "challenge" | "responses">;
type Response = PassportEntry["responses"][number];

/** Where a meeting stands, furthest first wins: met, said yes, invited, said not now. */
const MEETING_ORDER = ["declined", "invited", "accepted", "met"] as const;

function furthestMeeting(responses: readonly Response[]): (typeof MEETING_ORDER)[number] | null {
  let furthest: (typeof MEETING_ORDER)[number] | null = null;
  for (const r of responses) {
    if (r.decision !== "meet") continue;
    const m = r.meeting;
    const stage = !m ? "invited" : m.status === "met" || (m.talentConfirmedMet && m.companyConfirmedMet) ? "met" : m.status;
    if (!furthest || MEETING_ORDER.indexOf(stage) > MEETING_ORDER.indexOf(furthest)) furthest = stage;
  }
  return furthest;
}

/** The highest total a person gave this work, or null before any score. */
export function bestTotal(responses: readonly Response[]): number | null {
  const totals = responses.map((r) => r.total).filter((t): t is number => typeof t === "number");
  return totals.length ? Math.max(...totals) : null;
}

/**
 * Where a finished challenge stands, in plain words: "Waits for a score", "Scored 8.5 of 10", "Invited",
 * "You said yes", "Not now", "You met". Meetings outrank the score, since they are the next step.
 */
export function workState(entry: Entry): string {
  if (entry.challenge.kind === "taster") return "Practice";
  const meeting = furthestMeeting(entry.responses);
  if (meeting === "met") return "You met";
  if (meeting === "accepted") return "You said yes";
  if (meeting === "invited") return "Invited";
  if (meeting === "declined") return "Not now";
  const total = bestTotal(entry.responses);
  if (total !== null) return `Scored ${totalOutOf(total)}`;
  return entry.responses.length ? "Answered" : "Waits for a score";
}
