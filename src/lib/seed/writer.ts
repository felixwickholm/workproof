import { randomUUID } from "node:crypto";
import { followUpQuestions } from "@/lib/ai/scripted/follow-ups";
import { blindWork } from "@/lib/blind/blind-work";
import { atAGlance } from "@/lib/blind/glance";
import { toOwnProof } from "@/lib/blind/project";
import { addReports, redact } from "@/lib/blind/redact";
import { DECISION_ACTIONS } from "@/lib/domain/decision-rules";
import { orderedScores, scoreProblem, totalOf } from "@/lib/domain/scoring";
import type { AuditEvent, Challenge, DecisionKind, MeetingStatus, SkillScore } from "@/lib/domain/types";
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
  points: readonly SkillScore["points"][];
  feedback: string;
  hoursAgo: number;
  meeting?: MeetingStatus;
  followUpAgreed?: boolean;
  hired?: boolean;
}

/**
 * Writes synthetic event data the way the services write live data: the same follow-up writer,
 * blind layer, "At a glance" line, decision shape, scores and audit lines. Times are hours before `now`.
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
  const challengeOf = (proofId: string) => {
    const challengeId = data.submissions.find((s) => s.id === proofId)?.challengeId;
    const challenge = data.challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error(`Seed proof ${proofId} has no challenge`);
    return challenge;
  };

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
    const spokenThinking = redact(seed.thinkAloud.transcript, known);
    const thinkAloud = { ...seed.thinkAloud, transcript: spokenThinking.text };
    const submittedAt = at(seed.hoursAgo);
    const proof = toOwnProof({
      proofId: seed.id,
      challenge,
      work: blind.work,
      explain: blind.explain,
      attachment: blind.attachment,
      spoken: seed.spoken,
      choice: seed.choice,
      thinkAloud,
      glance: atAGlance(blind.work, blind.explain),
      redactions: addReports(blind.report, spokenThinking.report),
      submittedAt,
      takenLabels: new Set(data.proofs.map((p) => p.label)),
    });

    const id = talentId(seed.person);
    rememberTalent(data.talents, { id, name: person.name, contact: person.contact }, true);
    // The picture is identity, like the name: it stays on Talent and never enters a proof.
    const talent = data.talents.find((t) => t.id === id);
    if (talent) talent.avatar = person.avatar;
    data.submissions.push({
      id: seed.id,
      challengeId: challenge.id,
      talentId: id,
      answer: seed.answer,
      explain,
      ...(seed.attachment ? { attachment: { ...seed.attachment } } : {}),
      ...(seed.spoken ? { spoken: true } : {}),
      ...(seed.choice ? { choice: seed.choice } : {}),
      thinkAloud: { ...seed.thinkAloud },
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
      detail: `${proof.label}: ${hidden} detail${hidden === 1 ? "" : "s"} hidden from the work and the spoken thinking before any reviewer or AI model read it.`,
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
        by: "Sharing",
        action: "Recorded consent",
        detail: `${proof.label} may be shared with other companies that hire for the same skills.`,
      });
    }
  }

  /** A human decision with the reviewer's own points, the meeting it opens and the audit lines the services would write. */
  function addDecision(input: SeedDecisionInput, reviewer = REVIEWERS[input.companyId]): void {
    const challenge = challengeOf(input.proofId);
    const given = challenge.coreSkills.map((skill, i) => ({ skillId: skill.id, points: input.points[i] ?? 0 }));
    const problem = input.points.length === challenge.coreSkills.length ? scoreProblem(given, challenge) : "one score per core skill";
    if (problem) throw new Error(`Seed decision on ${input.proofId}: ${problem}`);
    const scores = orderedScores(given, challenge);
    const total = totalOf(scores);
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
      scores,
      total,
    });
    log(input.hoursAgo, {
      actor: "human",
      by: reviewer,
      action: DECISION_ACTIONS[input.kind],
      detail: `${company} on ${label}: ${total} of 10 from the reviewer's own points. Feedback sent to the person.`,
    });
    if (input.kind === "meet") addMeeting(input, label, company);
  }

  function addMeeting(input: SeedDecisionInput, label: string, company: string): void {
    const status = input.meeting ?? "invited";
    data.meetings.push({
      id: `meet_${input.proofId}_${input.companyId}`,
      proofId: input.proofId,
      companyId: input.companyId,
      slot: pickMeetingSlot(data, input.proofId, input.companyId),
      status: "invited",
      talentConfirmedMet: false,
      companyConfirmedMet: false,
    });
    log(input.hoursAgo - 1 / 3600, {
      actor: "system",
      by: "Scheduler",
      action: "Sent a meeting invite",
      detail: `${label} invited to meet ${company}. Identity stays hidden until the person accepts.`,
    });
    const answeredAt = input.hoursAgo - Math.min(0.5, input.hoursAgo / 2);
    if (status === "declined") {
      const meeting = data.meetings[data.meetings.length - 1];
      meeting.status = "declined";
      log(answeredAt, { actor: "human", by: "Talent", action: DECLINE_ACTION, detail: `${label} declined ${company}. The name stays hidden.` });
      return;
    }
    if (status === "invited") return;
    acceptMeeting(input.proofId, input.companyId, answeredAt);
    if (status === "met") {
      confirmMet(input.proofId, input.companyId, input.hoursAgo - Math.min(2, input.hoursAgo * 0.75), {
        followUpAgreed: input.followUpAgreed,
        hired: input.hired,
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

  /** Both sides confirm the talk took place; the company then records a follow-up and, rarely, a hire. */
  function confirmMet(proofId: string, companyId: string, hoursAgo: number, after: { followUpAgreed?: boolean; hired?: boolean }): void {
    const meeting = data.meetings.find((m) => m.proofId === proofId && m.companyId === companyId);
    if (!meeting) throw new Error(`No meeting for ${proofId} at ${companyId}`);
    const company = companyName(companyId);
    const label = labelOf(proofId);
    Object.assign(meeting, { status: "met", talentConfirmedMet: true, companyConfirmedMet: true });
    log(hoursAgo, { actor: "human", by: company, action: "Confirmed the meeting took place", detail: `${label} and ${company}: confirmed by both sides.` });
    if (after.followUpAgreed !== undefined) {
      meeting.followUpAgreed = after.followUpAgreed;
      log(hoursAgo - 1 / 60, {
        actor: "human",
        by: company,
        action: "Recorded a follow-up",
        detail: `${label} and ${company}: ${after.followUpAgreed ? "a follow-up talk was agreed" : "no follow-up this time"}.`,
      });
    }
    if (after.hired) {
      meeting.hired = true;
      log(hoursAgo - 1 / 30, { actor: "human", by: company, action: "Recorded a hire", detail: `${company} hired the person behind ${label}.` });
    }
  }

  /** One company shares a proof it scored with another company that hires for the same skills, with the person's consent. */
  function recommend(proofId: string, fromCompanyId: string, toCompanyId: string, hoursAgo: number): void {
    const from = companyName(fromCompanyId);
    const to = companyName(toCompanyId);
    data.recommendations = [
      ...(data.recommendations ?? []),
      { id: `rec_${proofId}_${toCompanyId}`, proofId, fromCompanyId, toCompanyId, at: at(hoursAgo) },
    ];
    log(hoursAgo, {
      actor: "human",
      by: from,
      action: "Shared a good candidate",
      detail: `${labelOf(proofId)} from ${from}'s challenge shared with ${to}, with the person's consent. No name and no scores go with it.`,
    });
  }

  return { at, log, addProof, addDecision, acceptMeeting, confirmMet, recommend, talentId };
}
