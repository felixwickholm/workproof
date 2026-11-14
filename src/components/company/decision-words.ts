import type { Meeting, ReviewQueue } from "@/lib/domain/types";

export type DecidedEntry = ReviewQueue["decided"][number];

/** The decision as the company made it: "Meet" or "Not now". Never "pass", "reject" or a score. */
export function decisionLabel(entry: Pick<DecidedEntry, "decision">): "Meet" | "Not now" {
  return entry.decision.decision === "meet" ? "Meet" : "Not now";
}

/** Where a meeting stands, from the company's side, in a few words. */
export function meetingWords(meeting: Meeting | undefined): string {
  if (!meeting) return "written answer sent";
  if (meeting.status === "declined") return "declined, name hidden";
  if (meeting.status === "met" || (meeting.companyConfirmedMet && meeting.talentConfirmedMet)) return "met, confirmed by both";
  if (meeting.companyConfirmedMet) return "you confirmed you met";
  if (meeting.status === "accepted") return "accepted";
  return "invited, name hidden";
}

/** "Meet · accepted", "Not now · written answer sent": the one status line of an answered proof. */
export function decidedLine(entry: Pick<DecidedEntry, "decision" | "meeting" | "withdrawn">): string {
  const line = `${decisionLabel(entry)} · ${meetingWords(entry.meeting)}`;
  return entry.withdrawn ? `${line} · withdrawn from Second look` : line;
}

/** The company's view of an invitation the person declined. */
export const DECLINED_LINE = "The person declined. Their name stays hidden.";

/** True once the person accepted, the only moment their name and contact reach the company. Never after a decline. */
export function nameShown(entry: Pick<DecidedEntry, "meeting" | "identity">): boolean {
  const status = entry.meeting?.status;
  return Boolean(entry.identity && (status === "accepted" || status === "met"));
}

/** Answered proofs, newest decision first. */
export function newestFirst(decided: readonly DecidedEntry[]): DecidedEntry[] {
  return [...decided].sort((a, b) => Date.parse(b.decision.decidedAt) - Date.parse(a.decision.decidedAt));
}
