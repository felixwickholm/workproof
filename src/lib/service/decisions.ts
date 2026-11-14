import type { Decision, DecisionKind, Meeting } from "@/lib/domain/types";
import { secondLookMatches } from "@/lib/matching/second-look";
import { getStore, type StoreData } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { DECISION_ACTIONS, decisionInputProblem } from "@/lib/domain/decision-rules";
import { NAMED_PERSON_NEEDED } from "@/lib/domain/guardrails";
import { isRegisteredReviewer } from "./reviewers";

interface DecideInput {
  proofId: string;
  companyId: string;
  reviewer: string;
  decision: DecisionKind;
  feedback: string;
}

/** Meetings on the event day: 15-minute steps from 13:00 to 16:45, at six tables. */
const FIRST_SLOT_MINUTES = 13 * 60;
const SLOT_STEP_MINUTES = 15;
const SLOT_TIMES = 16;
export const MEETING_TABLES = 6;
/** The slot text when every time is taken for that company or that person. */
export const TIME_TO_BE_AGREED = "Time to be agreed";

/** "13:00", "13:15", ... "16:45". */
export const SLOT_TIMES_OF_DAY: readonly string[] = Array.from({ length: SLOT_TIMES }, (_, i) => {
  const minutes = FIRST_SLOT_MINUTES + i * SLOT_STEP_MINUTES;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
});

const SLOT = /(\d{1,2}:\d{2}), Table (\d+)$/;

/** The time and table of a slot text, or undefined for "Time to be agreed". */
export function parseSlot(slot: string): { time: string; table: number } | undefined {
  const match = SLOT.exec(slot);
  return match ? { time: match[1], table: Number(match[2]) } : undefined;
}

/** "Sat" for the event day. */
function eventWeekday(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
}

/**
 * The first free proposed slot for a new invitation, in grid order, so the same store always gives the
 * same answer. Free means: no other meeting sits at that time and table, the company meets nobody else
 * at that time, and the person meets no other company at that time. A declined invitation frees its slot.
 * When the day is full for them, the slot reads "Time to be agreed".
 */
export function pickMeetingSlot(data: Pick<StoreData, "event" | "meetings" | "submissions">, proofId: string, companyId: string): string {
  const talentOf = new Map(data.submissions.map((s) => [s.id, s.talentId]));
  const person = talentOf.get(proofId);
  const taken = data.meetings
    .filter((m) => m.status !== "declined")
    .flatMap((m) => {
      const at = parseSlot(m.slot);
      return at ? [{ ...at, companyId: m.companyId, talentId: talentOf.get(m.proofId) }] : [];
    });
  for (const time of SLOT_TIMES_OF_DAY) {
    const atTime = taken.filter((t) => t.time === time);
    if (atTime.some((t) => t.companyId === companyId || (person !== undefined && t.talentId === person))) continue;
    for (let table = 1; table <= MEETING_TABLES; table++) {
      if (!atTime.some((t) => t.table === table)) return `${eventWeekday(data.event.date)} ${time}, Table ${table}`;
    }
  }
  return TIME_TO_BE_AGREED;
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
  const problem = decisionInputProblem(reviewer, feedback);
  if (problem) throw new ServiceError(400, problem);

  return getStore().update((data) => {
    const now = clock.now();
    const company = findOrThrow(data.companies, (c) => c.id === input.companyId, "Company");
    if (!isRegisteredReviewer(company, reviewer)) {
      throw new ServiceError(403, `${NAMED_PERSON_NEEDED} ${reviewer} is not a reviewer for ${company.name} yet: add yourself as a reviewer first.`);
    }
    const { submission, proof, challenge } = context(data, input.proofId);

    if (data.decisions.some((d) => d.proofId === proof.proofId && d.companyId === company.id)) {
      throw new ServiceError(409, `${company.name} has already decided on this proof`);
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
    if (!owner && !viaSecondLook) throw new ServiceError(403, `This proof is not in the queue of ${company.name}`);

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
      action: DECISION_ACTIONS[input.decision],
      detail: `${company.name} on ${proof.label}${viaSecondLook ? " through Second look" : ""}. Feedback sent to the person.`,
    });

    let meeting: Meeting | undefined;
    if (input.decision === "meet") {
      meeting = {
        id: newId("meet"),
        proofId: proof.proofId,
        companyId: company.id,
        slot: pickMeetingSlot(data, proof.proofId, company.id),
        status: "invited",
        talentConfirmedMet: false,
        companyConfirmedMet: false,
      };
      data.meetings.push(meeting);
      appendAudit(data, {
        actor: "system",
        by: "Scheduler",
        action: "Sent a meeting invite",
        detail: `${proof.label} invited to meet ${company.name}, proposed time: ${meeting.slot}. Identity stays hidden until the person accepts.`,
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
          by: "Second look",
          action: "Shared a blind proof",
          detail: `${proof.label} is now visible to ${opened.length} other employer${opened.length === 1 ? "" : "s"} with the same core skills.`,
        });
      }
    }
    return { decision, meeting };
  });
}
