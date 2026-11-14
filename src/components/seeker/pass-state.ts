import type { PassportEntry } from "@/lib/domain/types";

export type PassStateId = "practice" | "waiting" | "not-now" | "declined" | "invited" | "accepted" | "met";

export interface PassState {
  id: PassStateId;
  /** The words on the pass, as the person reads them. Never "rejected". */
  label: string;
  /** Green only once someone wants to meet; a "not now" is a normal answer and stays neutral. */
  tone: "neutral" | "positive";
}

const STATES: Record<PassStateId, Omit<PassState, "id">> = {
  practice: { label: "Practice, not sent to a company", tone: "neutral" },
  waiting: { label: "Waiting for a reader", tone: "neutral" },
  "not-now": { label: "Not now, with a reason", tone: "neutral" },
  declined: { label: "You said not now to the invitation", tone: "neutral" },
  invited: { label: "Invited", tone: "positive" },
  accepted: { label: "Meeting accepted", tone: "positive" },
  met: { label: "Met", tone: "positive" },
};

type Entry = Pick<PassportEntry, "challenge" | "responses" | "seenByHumans">;

type MeetingStage = "declined" | "invited" | "accepted" | "met";
/** Furthest last: an open invitation outranks one the person declined. */
const STAGE_ORDER: MeetingStage[] = ["declined", "invited", "accepted", "met"];

function meetingStage(entry: Entry): MeetingStage | null {
  let furthest: MeetingStage | null = null;
  for (const r of entry.responses) {
    if (r.decision !== "meet") continue;
    const m = r.meeting;
    const stage: MeetingStage = !m ? "invited" : m.status === "met" || (m.talentConfirmedMet && m.companyConfirmedMet) ? "met" : m.status;
    if (!furthest || STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(furthest)) furthest = stage;
  }
  return furthest;
}

/** Where one proof stands, at the furthest step any company took. */
export function passState(entry: Entry): PassState {
  const id: PassStateId =
    entry.challenge.kind === "taster" ? "practice" : (meetingStage(entry) ?? (entry.responses.length > 0 ? "not-now" : "waiting"));
  return { id, ...STATES[id] };
}

export interface TimelineStep {
  label: string;
  done: boolean;
  /** ISO time, when the step's time is known. */
  at?: string;
}

/** Sent, Read by a person, Answered, Invited, Accepted, Met: each marked once any company reached it. A declined invitation was still an invitation. */
export function proofTimeline(entry: Entry & { proof: { submittedAt: string } }): TimelineStep[] {
  const stage = meetingStage(entry);
  const reached = (s: "invited" | "accepted" | "met") =>
    stage !== null && (stage === "declined" ? s === "invited" : STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(s));
  return [
    { label: "Sent", done: true, at: entry.proof.submittedAt },
    { label: "Read by a person", done: entry.seenByHumans > 0 || entry.responses.length > 0 },
    { label: "Answered", done: entry.responses.length > 0 },
    { label: "Invited", done: reached("invited") },
    { label: "Accepted", done: reached("accepted") },
    { label: "Met", done: reached("met") },
  ];
}

/** "3 proofs · 2 written reasons · 1 invitation". */
export function passportCounts(passport: readonly Pick<PassportEntry, "responses">[]): string {
  const answers = passport.reduce((n, e) => n + e.responses.length, 0);
  const invitations = passport.reduce((n, e) => n + e.responses.filter((r) => r.decision === "meet").length, 0);
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  return [plural(passport.length, "proof", "proofs"), plural(answers, "written reason", "written reasons"), plural(invitations, "invitation", "invitations")].join(" · ");
}
