import type { Meeting } from "@/lib/domain/types";
import { getStore, type StoreData } from "@/lib/store";
import { appendAudit, findOrThrow, ServiceError } from "./support";

/** Who confirms a meeting. The talent proves it with their private id, the company with its id. */
export type ConfirmSide = { side: "talent"; talentId: string } | { side: "company"; companyId: string };

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

export async function confirmMeeting(meetingId: string, who: ConfirmSide): Promise<Meeting> {
  return getStore().update((data) => {
    const { meeting, company, proof, submission } = context(data, meetingId);
    if (who.side === "talent" && submission.talentId !== who.talentId) throw new ServiceError(403, NOT_YOURS);
    if (who.side === "company" && meeting.companyId !== who.companyId) {
      throw new ServiceError(403, "Only the company that sent the invitation can confirm it");
    }
    if (meeting.status === "invited") throw new ServiceError(409, "The meeting has not been accepted yet");

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
