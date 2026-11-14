import { draftFromNeed } from "@/lib/ai/scripted/compose";
import { followUpQuestions } from "@/lib/ai/scripted/follow-ups";
import { describeWork } from "@/lib/ai/scripted/summarise";
import { toBlindProof } from "@/lib/blind/project";
import { addReports, redact } from "@/lib/blind/redact";
import type { AuditEvent, Challenge, Decision, Meeting } from "@/lib/domain/types";
import { FOLLOW_UP_ACTION } from "@/lib/service/ai-work";
import { meetingSlot } from "@/lib/service/decisions";
import type { StoreData } from "@/lib/store/types";
import { COMPANIES, SEED_CHALLENGES } from "./companies";
import { SEED_PROOFS } from "./proofs";

export { DEMO_TALENT_ID } from "./proofs";

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
    const draft = draftFromNeed(seed.need);
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
      action: "Drafted a Problem Card",
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

  for (const seed of SEED_PROOFS) {
    const challenge = challenges[seed.challenge];
    const known = { name: seed.talent.name, contact: seed.talent.contact };
    const questions = followUpQuestions(challenge, seed.answer);
    const explain = questions.map((question, i) => ({ question, answer: seed.explainAnswers[i] ?? "" }));

    const work = redact(seed.answer, known);
    let report = work.report;
    const blindExplain = explain.map(({ question, answer }) => {
      const q = redact(question, known);
      const a = redact(answer, known);
      report = addReports(report, addReports(q.report, a.report));
      return { question: q.text, answer: a.text };
    });
    const submittedAt = at(seed.minutesAgo * MINUTE);
    const proof = toBlindProof({
      proofId: seed.id,
      challenge,
      work: work.text,
      explain: blindExplain,
      aiSummary: describeWork(challenge, work.text, blindExplain),
      redactions: report,
      submittedAt,
    });

    data.talents.push({ ...seed.talent });
    data.submissions.push({
      id: seed.id,
      challengeId: challenge.id,
      talentId: seed.talent.id,
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
    const hidden = Object.values(report).reduce((sum, n) => sum + n, 0);
    log(seed.minutesAgo * MINUTE, {
      actor: "system",
      by: "Blind layer",
      action: "Hid identity from the work",
      detail: `${proof.label}: ${hidden} detail${hidden === 1 ? "" : "s"} hidden before any reviewer or AI read it.`,
    });
    log(seed.minutesAgo * MINUTE - 1000, {
      actor: "ai",
      by: "Work describer",
      action: "Described the work",
      detail: `${proof.label}: a neutral summary of what the work contains. No score, no ranking.`,
    });

    const decision = seed.decision;
    if (!decision) continue;
    const company = COMPANIES.find((c) => c.id === decision.companyId);
    data.decisions.push({
      id: `dec_${seed.id}`,
      proofId: seed.id,
      companyId: decision.companyId,
      reviewer: decision.reviewer,
      decision: decision.kind,
      feedback: decision.feedback,
      decidedAt: at(decision.minutesAgo * MINUTE),
    });
    log(decision.minutesAgo * MINUTE, {
      actor: "human",
      by: decision.reviewer,
      action: decision.kind === "meet" ? "Chose to meet" : "Passed with feedback",
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
