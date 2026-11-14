import { randomUUID } from "node:crypto";
import { followUpQuestions } from "@/lib/ai/scripted/follow-ups";
import { blindWork } from "@/lib/blind/blind-work";
import { atAGlance } from "@/lib/blind/glance";
import { toOwnProof } from "@/lib/blind/project";
import { redact } from "@/lib/blind/redact";
import { DECISION_ACTIONS } from "@/lib/domain/decision-rules";
import type { AuditEvent, Challenge, DecisionKind, MeetingStatus } from "@/lib/domain/types";
import { FOLLOW_UP_ACTION, HIDE_ACTION, SHAPE_ACTION } from "@/lib/service/ai-work";
import { pickMeetingSlot } from "@/lib/service/decisions";
import { DECLINE_ACTION } from "@/lib/service/meetings";
import { rememberTalent } from "@/lib/service/talent";
import type { StoreData } from "@/lib/store/types";
import { companyName, REVIEWERS } from "./companies";
import { PEOPLE, type PersonKey } from "./people";
import type { SeedProof } from "./types";

const HOUR = 3_600_000;

export interface SeedDecisionInput {
  proofId: string;
  companyId: string;
  kind: DecisionKind;
  feedback: string;
  hoursAgo: number;
  meeting?: MeetingStatus;
}

/**
 * Writes synthetic event data the way the services write live data: the same follow-up writer,
 * blind layer, "At a glance" line, decision shape and audit lines. Times are hours before `now`.
 */
export function seedWriter(now: Date, data: StoreData) {
  const at = (hoursAgo: number) => new Date(now.getTime() - Math.round(hoursAgo * HOUR)).toISOString();
  const log = (hoursAgo: number, event: Omit<AuditEvent, "id" | "at">) =>
    data.audit.push({ id: `audit_seed_${String(data.audit.length + 1).padStart(3, "0")}`, at: at(hoursAgo), ...event });

  // Talent ids are private keys, so every rebuild gives the synthetic people new random ones.
  const talentIds = new Map<PersonKey, string>();
  const talentId = (person: PersonKey) => {
    const id = talentIds.get(person) ?? `t_${randomUUID()}`;
    talentIds.set(person, id);
    return id;
  };
  const companies = data.companies.map((c) => c.name);
  const labelOf = (proofId: string) => data.proofs.find((p) => p.proofId === proofId)?.label ?? proofId;

  function addProof(seed: SeedProof, challenge: Challenge): void {
    const person = PEOPLE[seed.person];
    const known = { name: person.name, contact: person.contact, companies };
    // Like live submissions, the follow-up writer reads the answer only after the blind layer.
    const questions = followUpQuestions(challenge, redact(seed.answer, known).text);
    const explain = questions.map((question, i) => ({
      question,
      answer: seed.explainAnswers[i] ?? "",
      ...(seed.spokenFollowUps ? { spoken: true } : {}),
    }));
    const blind = blindWork(seed.answer, explain, known, seed.attachment);
    const submittedAt = at(seed.hoursAgo);
    const proof = toOwnProof({
      proofId: seed.id,
      challenge,
      work: blind.work,
      explain: blind.explain,
      attachment: blind.attachment,
      spoken: seed.spoken,
      glance: atAGlance(blind.work, blind.explain),
      redactions: blind.report,
      submittedAt,
      takenLabels: new Set(data.proofs.map((p) => p.label)),
    });

    const id = talentId(seed.person);
    rememberTalent(data.talents, { id, ...person }, true);
    data.submissions.push({
      id: seed.id,
      challengeId: challenge.id,
      talentId: id,
      answer: seed.answer,
      explain,
      ...(seed.attachment ? { attachment: { ...seed.attachment } } : {}),
      ...(seed.spoken ? { spoken: true } : {}),
      shareWithSimilar: seed.shareWithSimilar,
      submittedAt,
    });
    data.proofs.push(proof);

    const minute = 1 / 60;
    log(seed.hoursAgo - 2 * minute, {
      actor: "ai",
      by: "Follow-up writer",
      action: FOLLOW_UP_ACTION,
      detail: `${questions.length} question${questions.length === 1 ? "" : "s"} on "${challenge.title}".`,
    });
    const hidden = proof.hiddenCount;
    log(seed.hoursAgo, {
      actor: "system",
      by: "Blind layer",
      action: HIDE_ACTION,
      detail: `${proof.label}: ${hidden} detail${hidden === 1 ? "" : "s"} hidden before any reviewer or AI model read it.`,
    });
    log(seed.hoursAgo - minute / 60, {
      actor: "system",
      by: "At a glance",
      action: SHAPE_ACTION,
      detail: `${proof.label}: counted points, words and code. Nothing about quality.`,
    });
    if (seed.shareWithSimilar) {
      log(seed.hoursAgo - minute / 30, {
        actor: "system",
        by: "Second look",
        action: "Recorded consent",
        detail: `${proof.label} may be shown to other employers with the same core skills if the first employer says not now or does not answer in time.`,
      });
    }
  }

  /** A human decision, with the meeting it opens and the audit lines the services would write. */
  function addDecision(input: SeedDecisionInput, viaSecondLook = false): void {
    const reviewer = REVIEWERS[input.companyId];
    const company = companyName(input.companyId);
    const label = labelOf(input.proofId);
    data.decisions.push({
      id: `dec_${input.proofId}_${input.companyId}`,
      proofId: input.proofId,
      companyId: input.companyId,
      reviewer,
      decision: input.kind,
      feedback: input.feedback,
      decidedAt: at(input.hoursAgo),
    });
    log(input.hoursAgo, {
      actor: "human",
      by: reviewer,
      action: DECISION_ACTIONS[input.kind],
      detail: `${company} on ${label}${viaSecondLook ? " through Second look" : ""}. Feedback sent to the person.`,
    });
    if (input.kind === "meet") addMeeting(input, label, company);
  }

  function addMeeting(input: SeedDecisionInput, label: string, company: string): void {
    const status = input.meeting ?? "invited";
    const met = status === "met";
    data.meetings.push({
      id: `meet_${input.proofId}_${input.companyId}`,
      proofId: input.proofId,
      companyId: input.companyId,
      slot: pickMeetingSlot(data, input.proofId, input.companyId),
      status,
      talentConfirmedMet: met,
      companyConfirmedMet: met,
    });
    log(input.hoursAgo - 1 / 3600, {
      actor: "system",
      by: "Scheduler",
      action: "Sent a meeting invite",
      detail: `${label} invited to meet ${company}. Identity stays hidden until the person accepts.`,
    });
    if (status === "declined") {
      log(input.hoursAgo - Math.min(0.5, input.hoursAgo / 2), {
        actor: "human",
        by: "Talent",
        action: DECLINE_ACTION,
        detail: `${label} declined ${company}. The name stays hidden.`,
      });
      return;
    }
    if (status !== "invited") acceptMeeting(input.proofId, input.companyId, input.hoursAgo - Math.min(0.5, input.hoursAgo / 2));
    if (met) {
      log(input.hoursAgo - Math.min(2, input.hoursAgo * 0.75), {
        actor: "human",
        by: company,
        action: "Confirmed the meeting took place",
        detail: `${label} and ${company}: confirmed by both sides.`,
      });
    }
  }

  /** The person accepts: only now does the company see the name and contact. */
  function acceptMeeting(proofId: string, companyId: string, hoursAgo: number): void {
    const meeting = data.meetings.find((m) => m.proofId === proofId && m.companyId === companyId);
    if (meeting && meeting.status === "invited") meeting.status = "accepted";
    const company = companyName(companyId);
    log(hoursAgo, {
      actor: "human",
      by: "Talent",
      action: "Accepted a meeting",
      detail: `${labelOf(proofId)} accepted ${company}. Name and contact are now shared with ${company} only.`,
    });
  }

  /** The audit line when an owner's "not now" opens a consented proof to similar employers. */
  function logSecondLookOpened(proofId: string, hoursAgo: number): void {
    log(hoursAgo - 1 / 3600, {
      actor: "system",
      by: "Second look",
      action: "Shared a blind proof",
      detail: `${labelOf(proofId)} is now visible to other employers with the same core skills.`,
    });
  }

  return { at, log, addProof, addDecision, acceptMeeting, logSecondLookOpened, talentId };
}
