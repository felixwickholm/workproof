import type { Meeting } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { appendAudit, findOrThrow, ServiceError } from "./support";

export async function acceptMeeting(meetingId: string): Promise<Meeting> {
  return getStore().update((data) => {
    const meeting = findOrThrow(data.meetings, (m) => m.id === meetingId, "Meeting");
    if (meeting.status !== "invited") return meeting;
    const company = findOrThrow(data.companies, (c) => c.id === meeting.companyId, "Company");
    const proof = findOrThrow(data.proofs, (p) => p.proofId === meeting.proofId, "Proof");
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

export async function confirmMeeting(meetingId: string, side: "talent" | "company"): Promise<Meeting> {
  return getStore().update((data) => {
    const meeting = findOrThrow(data.meetings, (m) => m.id === meetingId, "Meeting");
    if (meeting.status === "invited") throw new ServiceError(409, "The meeting has not been accepted yet");
    const company = findOrThrow(data.companies, (c) => c.id === meeting.companyId, "Company");
    const proof = findOrThrow(data.proofs, (p) => p.proofId === meeting.proofId, "Proof");

    if (side === "talent") meeting.talentConfirmedMet = true;
    else meeting.companyConfirmedMet = true;
    if (meeting.talentConfirmedMet && meeting.companyConfirmedMet) meeting.status = "met";

    appendAudit(data, {
      actor: "human",
      by: side === "talent" ? "Talent" : company.name,
      action: "Confirmed the meeting took place",
      detail: `${proof.label} and ${company.name}${meeting.status === "met" ? ": confirmed by both sides." : ": waiting for the other side."}`,
    });
    return meeting;
  });
}
