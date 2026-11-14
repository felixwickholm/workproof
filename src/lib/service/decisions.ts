import type { Decision, DecisionKind, Meeting } from "@/lib/domain/types";
import { secondLookMatches } from "@/lib/matching/second-look";
import { getStore, type StoreData } from "@/lib/store";
import { hash, newId } from "@/lib/util/hash";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";

export const MIN_FEEDBACK_CHARS = 20;

export interface DecideInput {
  proofId: string;
  companyId: string;
  reviewer: string;
  decision: DecisionKind;
  feedback: string;
}

/** A 15-minute slot at the event, stable for the same proof and company. */
export function meetingSlot(proofId: string, companyId: string): string {
  const h = hash(`${proofId}:${companyId}`);
  const minutes = 13 * 60 + (h % 15) * 20;
  const time = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
  return `Sat ${time}, Table ${(Math.floor(h / 15) % 12) + 1}`;
}

function context(data: StoreData, proofId: string) {
  const submission = findOrThrow(data.submissions, (s) => s.id === proofId, "Proof");
  const proof = findOrThrow(data.proofs, (p) => p.proofId === proofId, "Proof");
  const challenge = findOrThrow(data.challenges, (c) => c.id === submission.challengeId, "Challenge");
  return { submission, proof, challenge };
}

export async function decide(input: DecideInput): Promise<{ decision: Decision; meeting?: Meeting }> {
  const reviewer = input.reviewer.trim();
  const feedback = input.feedback.trim();
  if (!reviewer) throw new ServiceError(400, "Add the name of the person who decided");
  if (feedback.length < MIN_FEEDBACK_CHARS) {
    throw new ServiceError(400, `Feedback needs at least ${MIN_FEEDBACK_CHARS} characters, so the person learns something`);
  }

  return getStore().update((data) => {
    const now = clock.now();
    const company = findOrThrow(data.companies, (c) => c.id === input.companyId, "Company");
    const { submission, proof, challenge } = context(data, input.proofId);

    if (data.decisions.some((d) => d.proofId === proof.proofId && d.companyId === company.id)) {
      throw new ServiceError(409, `${company.name} has already decided on ${proof.label}`);
    }
    const owner = challenge.kind === "event" && challenge.companyIds.includes(company.id);
    const viaSecondLook =
      !owner &&
      secondLookMatches({
        submission,
        challenge,
        decisions: data.decisions,
        challenges: data.challenges,
        responseWindowHours: data.event.responseWindowHours,
        now,
      }).some((m) => m.companyId === company.id);
    if (!owner && !viaSecondLook) throw new ServiceError(403, `${proof.label} is not in the queue of ${company.name}`);

    const decision: Decision = {
      id: newId("dec"),
      proofId: proof.proofId,
      companyId: company.id,
      reviewer,
      decision: input.decision,
      feedback,
      decidedAt: now.toISOString(),
    };
    data.decisions.push(decision);
    appendAudit(data, {
      actor: "human",
      by: reviewer,
      action: input.decision === "meet" ? "Chose to meet" : "Passed with feedback",
      detail: `${company.name} on ${proof.label}${viaSecondLook ? " through Second Look" : ""}. Feedback sent to the person.`,
    });

    let meeting: Meeting | undefined;
    if (input.decision === "meet") {
      meeting = {
        id: newId("meet"),
        proofId: proof.proofId,
        companyId: company.id,
        slot: meetingSlot(proof.proofId, company.id),
        status: "invited",
        talentConfirmedMet: false,
        companyConfirmedMet: false,
      };
      data.meetings.push(meeting);
      appendAudit(data, {
        actor: "system",
        by: "Scheduler",
        action: "Sent a meeting invite",
        detail: `${proof.label} invited to meet ${company.name}, ${meeting.slot}. Identity stays hidden until the person accepts.`,
      });
    } else if (owner) {
      const opened = secondLookMatches({
        submission,
        challenge,
        decisions: data.decisions,
        challenges: data.challenges,
        responseWindowHours: data.event.responseWindowHours,
        now,
      });
      if (opened.length > 0) {
        appendAudit(data, {
          actor: "system",
          by: "Second Look",
          action: "Shared a blind proof",
          detail: `${proof.label} is now visible to ${opened.length} other employer${opened.length === 1 ? "" : "s"} with the same core skills.`,
        });
      }
    }
    return { decision, meeting };
  });
}
