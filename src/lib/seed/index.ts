import { randomUUID } from "node:crypto";
import { draftFromNeed } from "@/lib/ai/scripted/compose";
import { followUpQuestions } from "@/lib/ai/scripted/follow-ups";
import { blindWork } from "@/lib/blind/blind-work";
import { atAGlance } from "@/lib/blind/glance";
import { toOwnProof } from "@/lib/blind/project";
import { redact } from "@/lib/blind/redact";
import type { AuditEvent, Challenge, Decision, Meeting } from "@/lib/domain/types";
import { DRAFT_ACTION, FOLLOW_UP_ACTION, HIDE_ACTION, SHAPE_ACTION } from "@/lib/service/ai-work";
import { meetingSlot } from "@/lib/service/decisions";
import { rememberTalent } from "@/lib/service/talent";
import type { StoreData } from "@/lib/store/types";
import { omit } from "@/lib/util/object";
import { COMPANIES, REVIEWERS, SEED_CHALLENGES } from "./companies";
import { SEED_PROOFS } from "./proofs";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/**
 * A synthetic event, "Espoo Talent Day", built relative to `now` so the demo always looks current.
 * All companies, people and work are invented. Content runs through the same scripted designer
 * and blind layer as live submissions.
 */
export function buildSeed(now: Date): StoreData {
  const at = (msAgo: number) => new Date(now.getTime() - msAgo).toISOString();
  const audit: AuditEvent[] = [];
  const log = (msAgo: number, event: Omit<AuditEvent, "id" | "at">) =>
    audit.push({ id: `audit_seed_${String(audit.length + 1).padStart(3, "0")}`, at: at(msAgo), ...event });

  const challenges: Record<string, Challenge> = {};
  for (const seed of SEED_CHALLENGES) {
    const draft = omit(draftFromNeed(seed.need), ["note"]);
    const createdMsAgo = seed.daysBeforeEvent * DAY;
    challenges[seed.key] = {
      ...draft,
      id: `ch-${seed.key}`,
      companyIds: [...seed.companyIds],
      approvedBy: seed.approvedBy,
      createdAt: at(createdMsAgo),
    };
    const names = seed.companyIds.map((id) => COMPANIES.find((c) => c.id === id)?.name).join(" and ");
    log(createdMsAgo + 20 * MINUTE, {
      actor: "ai",
      by: "Task drafter",
      action: DRAFT_ACTION,
      detail: `"${draft.title}": ${draft.coreSkills.length} core skills kept, ${draft.setAside.length} wishes set aside. Waiting for a human to approve.`,
    });
    log(createdMsAgo, {
      actor: "human",
      by: seed.approvedBy,
      action: "Approved a Problem Card",
      detail: `${names} published "${draft.title}".`,
    });
  }

  const data: StoreData = {
    version: 1,
    event: { name: "Espoo Talent Day", date: now.toISOString().slice(0, 10), responseWindowHours: 48 },
    companies: COMPANIES.map((c) => ({ ...c })),
    challenges: Object.values(challenges),
    talents: [],
    submissions: [],
    proofs: [],
    decisions: [] as Decision[],
    meetings: [] as Meeting[],
    audit,
  };

  // Talent ids are private keys, so every reset gives the synthetic people new random ones.
  const talentIds = new Map<string, string>();
  for (const seed of SEED_PROOFS) {
    const challenge = challenges[seed.challenge];
    const talentId = talentIds.get(seed.talent.id) ?? `t_${randomUUID()}`;
    talentIds.set(seed.talent.id, talentId);
    const known = { name: seed.talent.name, contact: seed.talent.contact };
    // Like live submissions, the follow-up writer reads the answer only after the blind layer.
    const questions = followUpQuestions(challenge, redact(seed.answer, known).text);
    const explain = questions.map((question, i) => ({ question, answer: seed.explainAnswers[i] ?? "" }));

    const blind = blindWork(seed.answer, explain, known);
    const submittedAt = at(seed.minutesAgo * MINUTE);
    const proof = toOwnProof({
      proofId: seed.id,
      challenge,
      work: blind.work,
      explain: blind.explain,
      aiSummary: atAGlance(blind.work, blind.explain),
      redactions: blind.report,
      submittedAt,
      takenLabels: new Set(data.proofs.map((p) => p.label)),
    });

    rememberTalent(data.talents, { ...seed.talent, id: talentId }, true);
    data.submissions.push({
      id: seed.id,
      challengeId: challenge.id,
      talentId,
      answer: seed.answer,
      explain,
      shareWithSimilar: seed.shareWithSimilar,
      submittedAt,
    });
    data.proofs.push(proof);
    log(seed.minutesAgo * MINUTE + 2 * MINUTE, {
      actor: "ai",
      by: "Follow-up writer",
      action: FOLLOW_UP_ACTION,
      detail: `${questions.length} question${questions.length === 1 ? "" : "s"} on "${challenge.title}".`,
    });
    const hidden = proof.hiddenCount;
    log(seed.minutesAgo * MINUTE, {
      actor: "system",
      by: "Blind layer",
      action: HIDE_ACTION,
      detail: `${proof.label}: ${hidden} detail${hidden === 1 ? "" : "s"} hidden before any reviewer or AI model read it.`,
    });
    log(seed.minutesAgo * MINUTE - 1000, {
      actor: "system",
      by: "At a glance",
      action: SHAPE_ACTION,
      detail: `${proof.label}: counted points, words and code. Nothing about quality.`,
    });

    const decision = seed.decision;
    if (!decision) continue;
    const company = COMPANIES.find((c) => c.id === decision.companyId);
    const reviewer = REVIEWERS[decision.companyId];
    data.decisions.push({
      id: `dec_${seed.id}`,
      proofId: seed.id,
      companyId: decision.companyId,
      reviewer,
      decision: decision.kind,
      feedback: decision.feedback,
      decidedAt: at(decision.minutesAgo * MINUTE),
    });
    log(decision.minutesAgo * MINUTE, {
      actor: "human",
      by: reviewer,
      action: decision.kind === "meet" ? "Chose to meet" : "Said not now, with a reason",
      detail: `${company?.name} on ${proof.label}. Feedback sent to the person.`,
    });
    if (decision.meeting) {
      const met = decision.meeting === "met";
      data.meetings.push({
        id: `meet_${seed.id}`,
        proofId: seed.id,
        companyId: decision.companyId,
        slot: meetingSlot(seed.id, decision.companyId),
        status: decision.meeting,
        talentConfirmedMet: met,
        companyConfirmedMet: met,
      });
      log(decision.minutesAgo * MINUTE - 1000, {
        actor: "system",
        by: "Scheduler",
        action: "Sent a meeting invite",
        detail: `${proof.label} invited to meet ${company?.name}. Identity stays hidden until the person accepts.`,
      });
      if (decision.meeting !== "invited") {
        log(decision.minutesAgo * MINUTE - 30 * MINUTE, {
          actor: "human",
          by: "Talent",
          action: "Accepted a meeting",
          detail: `${proof.label} accepted ${company?.name}. Name and contact are now shared with ${company?.name} only.`,
        });
      }
      if (met) {
        log(decision.minutesAgo * MINUTE - 120 * MINUTE, {
          actor: "human",
          by: company?.name ?? "Company",
          action: "Confirmed the meeting took place",
          detail: `${proof.label} and ${company?.name}: confirmed by both sides.`,
        });
      }
    } else if (decision.kind === "pass" && seed.shareWithSimilar) {
      log(decision.minutesAgo * MINUTE - 1000, {
        actor: "system",
        by: "Second look",
        action: "Shared a blind proof",
        detail: `${proof.label} is now visible to other employers with the same core skills.`,
      });
    }
  }

  data.audit.sort((a, b) => a.at.localeCompare(b.at));
  return data;
}
