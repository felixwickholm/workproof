import type { Meeting } from "@/lib/domain/types";
import { getStore, type StoreData } from "@/lib/store";
import { appendAudit, findOrThrow, ServiceError } from "./support";

/** Who confirms a meeting. The talent proves it with their private id, the company with its id. */
type ConfirmSide = { side: "talent"; talentId: string } | { side: "company"; companyId: string };

function context(data: StoreData, meetingId: string) {
  const meeting = findOrThrow(data.meetings, (m) => m.id === meetingId, "Meeting");
  const company = findOrThrow(data.companies, (c) => c.id === meeting.companyId, "Company");
  const proof = findOrThrow(data.proofs, (p) => p.proofId === meeting.proofId, "Proof");
  const submission = findOrThrow(data.submissions, (s) => s.id === meeting.proofId, "Proof");
  return { meeting, company, proof, submission };
}

const NOT_YOURS = "Only the person who was invited can answer this invitation";

/** Only the author of the proof can accept. Their consent is what reveals the name. */
export async function acceptMeeting(meetingId: string, talentId: string): Promise<Meeting> {
  return getStore().update((data) => {
    const { meeting, company, proof, submission } = context(data, meetingId);
    if (submission.talentId !== talentId) throw new ServiceError(403, NOT_YOURS);
    if (meeting.status !== "invited") return meeting;
    meeting.status = "accepted";
    appendAudit(data, {
      actor: "human",
      by: "Talent",
      action: "Accepted a meeting",
      detail: `${proof.label} accepted ${company.name}, ${meeting.slot}. Name and contact are now shared with ${company.name} only.`,
    });
    return meeting;
  });
}

export const DECLINE_ACTION = "Declined a meeting";

/**
 * Only the author can decline, and only while the invitation is open. The name is never shown:
 * a declined invitation never reveals identity, and the decision and feedback the company wrote stay.
 */
export async function declineMeeting(meetingId: string, talentId: string): Promise<Meeting> {
  return getStore().update((data) => {
    const { meeting, company, proof, submission } = context(data, meetingId);
    if (submission.talentId !== talentId) throw new ServiceError(403, NOT_YOURS);
    if (meeting.status === "declined") return meeting;
    if (meeting.status !== "invited") throw new ServiceError(409, "This invitation was already accepted");
    meeting.status = "declined";
    appendAudit(data, {
      actor: "human",
      by: "Talent",
      action: DECLINE_ACTION,
      detail: `${proof.label} declined ${company.name}. The name stays hidden.`,
    });
    return meeting;
  });
}

export async function confirmMeeting(meetingId: string, who: ConfirmSide): Promise<Meeting> {
  return getStore().update((data) => {
    const { meeting, company, proof, submission } = context(data, meetingId);
    if (who.side === "talent" && submission.talentId !== who.talentId) throw new ServiceError(403, NOT_YOURS);
    if (who.side === "company" && meeting.companyId !== who.companyId) {
      throw new ServiceError(403, "Only the company that sent the invitation can confirm it");
    }
    if (meeting.status === "invited") throw new ServiceError(409, "The meeting has not been accepted yet");
    if (meeting.status === "declined") throw new ServiceError(409, "The person declined this invitation");

    const already = who.side === "talent" ? meeting.talentConfirmedMet : meeting.companyConfirmedMet;
    if (already) return meeting;
    if (who.side === "talent") meeting.talentConfirmedMet = true;
    else meeting.companyConfirmedMet = true;
    if (meeting.talentConfirmedMet && meeting.companyConfirmedMet) meeting.status = "met";

    appendAudit(data, {
      actor: "human",
      by: who.side === "talent" ? "Talent" : company.name,
      action: "Confirmed the meeting took place",
      detail: `${proof.label} and ${company.name}${meeting.status === "met" ? ": confirmed by both sides." : ": waiting for the other side."}`,
    });
    return meeting;
  });
}

/** The company side of a held meeting: only the inviting company, and only after both sides confirmed the talk. */
function heldMeeting(data: StoreData, meetingId: string, companyId: string) {
  const found = context(data, meetingId);
  if (found.meeting.companyId !== companyId) throw new ServiceError(403, "Only the company that sent the invitation can record this");
  if (found.meeting.status !== "met") throw new ServiceError(409, "Both sides confirm the talk took place first");
  return found;
}

/** After the talk at the event, the company records whether a follow-up was agreed. The city counts these. */
export async function recordFollowUp(meetingId: string, companyId: string, agreed: boolean): Promise<Meeting> {
  return getStore().update((data) => {
    const { meeting, company, proof } = heldMeeting(data, meetingId, companyId);
    meeting.followUpAgreed = agreed;
    appendAudit(data, {
      actor: "human",
      by: company.name,
      action: "Recorded a follow-up",
      detail: `${proof.label} and ${company.name}: ${agreed ? "a follow-up talk was agreed" : "no follow-up this time"}.`,
    });
    return meeting;
  });
}

/** The company records a hire after the talk. Only the company can say it; it is counted, never shown with a name. */
export async function recordHire(meetingId: string, companyId: string): Promise<Meeting> {
  return getStore().update((data) => {
    const { meeting, company, proof } = heldMeeting(data, meetingId, companyId);
    if (meeting.hired) return meeting;
    meeting.hired = true;
    appendAudit(data, { actor: "human", by: company.name, action: "Recorded a hire", detail: `${company.name} hired the person behind ${proof.label}.` });
    return meeting;
  });
}
