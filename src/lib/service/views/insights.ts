import { PROOF_KINDS } from "@/lib/domain/kinds";
import type { CityInsights, FlowState, Meeting } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { byArrival } from "../support";
import { countAutomatedDecisions } from "./automated";
import { DAY_MS, eventChallenges, eventProofs, eventTotals } from "./event";

const TOP_SKILLS = 8;
const ARRIVAL_DAYS = 8;

const accepted = (m: Meeting) => m.status === "accepted" || m.status === "met";

/** How far one proof got with any employer: a meeting held, an invitation, an answer, or only sent. */
const FLOW_ORDER: FlowState[] = ["sent", "answered", "invited", "met"];

function flowsOf(data: StoreData, proofs: StoreData["proofs"]): CityInsights["flows"] {
  const owners = new Map(data.challenges.map((c) => [c.id, c.companyIds]));
  return [...proofs].sort(byArrival).map((proof) => {
    let best: { companyId: string; state: FlowState } = { companyId: owners.get(proof.challengeId)?.[0] ?? "", state: "sent" };
    const raise = (companyId: string, state: FlowState) => {
      if (FLOW_ORDER.indexOf(state) > FLOW_ORDER.indexOf(best.state)) best = { companyId, state };
    };
    for (const d of data.decisions) if (d.proofId === proof.proofId) raise(d.companyId, "answered");
    for (const m of data.meetings) if (m.proofId === proof.proofId) raise(m.companyId, m.status === "met" ? "met" : "invited");
    return { proofLabel: proof.label, ...best };
  });
}

/** Proofs per day for the days up to the event day, so the city sees work arrive over days. */
function arrivals(data: StoreData, proofs: StoreData["proofs"]): CityInsights["arrivalsByDay"] {
  const eventDay = new Date(`${data.event.date}T00:00:00Z`).getTime();
  const perDay = new Map<string, number>();
  for (const p of proofs) perDay.set(p.submittedAt.slice(0, 10), (perDay.get(p.submittedAt.slice(0, 10)) ?? 0) + 1);
  return Array.from({ length: ARRIVAL_DAYS }, (_, i) => {
    const day = new Date(eventDay - (ARRIVAL_DAYS - 1 - i) * DAY_MS).toISOString().slice(0, 10);
    return { day, proofs: perDay.get(day) ?? 0 };
  });
}

/**
 * What the city learns from the event: demand, proof kinds, pooled tasks, the funnel and the
 * fairness record. Built from tasks, proof labels and decisions; no talent id, name or contact.
 */
export function buildCityInsights(data: StoreData): CityInsights {
  const challenges = eventChallenges(data);
  const proofs = eventProofs(data);
  const proofsFor = new Map<string, number>();
  for (const p of proofs) proofsFor.set(p.challengeId, (proofsFor.get(p.challengeId) ?? 0) + 1);
  const companyName = new Map(data.companies.map((c) => [c.id, c.name]));

  const skills = new Map<string, { skillId: string; label: string; tasks: number; proofs: number }>();
  for (const c of challenges) {
    for (const s of c.coreSkills) {
      const entry = skills.get(s.id) ?? { skillId: s.id, label: s.label, tasks: 0, proofs: 0 };
      entry.tasks += 1;
      entry.proofs += proofsFor.get(c.id) ?? 0;
      skills.set(s.id, entry);
    }
  }

  const eventDay = new Date(`${data.event.date}T00:00:00Z`).getTime();
  const eventIds = new Set(challenges.map((c) => c.id));
  const eventSubmissions = data.submissions.filter((s) => eventIds.has(s.challengeId));

  return {
    demandBySkill: [...skills.values()]
      .sort((a, b) => b.tasks - a.tasks || a.label.localeCompare(b.label))
      .slice(0, TOP_SKILLS),
    byProofKind: PROOF_KINDS.map((kind) => {
      const ofKind = challenges.filter((c) => c.proofKind === kind);
      return { kind, tasks: ofKind.length, proofs: ofKind.reduce((sum, c) => sum + (proofsFor.get(c.id) ?? 0), 0) };
    }).filter((row) => row.tasks > 0),
    pooled: challenges
      .filter((c) => c.companyIds.length > 1)
      .map((c) => ({
        challengeId: c.id,
        title: c.title,
        companies: c.companyIds.map((id) => companyName.get(id) ?? "An employer"),
        proofs: proofsFor.get(c.id) ?? 0,
      })),
    funnel: {
      proofs: proofs.length,
      answered: eventTotals(data).proofsAnswered,
      invited: data.meetings.length,
      accepted: data.meetings.filter(accepted).length,
      met: data.meetings.filter((m) => m.status === "met").length,
    },
    fairness: {
      automatedDecisions: countAutomatedDecisions(data),
      detailsHidden: proofs.reduce((sum, p) => sum + p.hiddenCount, 0),
      decisionsWithNamedHuman: data.decisions.filter((d) => d.reviewer.trim()).length,
      decisionsWithFeedback: data.decisions.filter((d) => d.feedback.trim()).length,
      secondLookConsents: eventSubmissions.filter((s) => s.shareWithSimilar).length,
      namesShownAfterAccept: data.meetings.filter(accepted).length,
      wishesSetAside: challenges.reduce((sum, c) => sum + c.setAside.length, 0),
    },
    readiness: {
      tasks: challenges.length,
      liveThreeDaysBefore: challenges.filter((c) => new Date(c.createdAt).getTime() <= eventDay - 3 * DAY_MS).length,
    },
    flows: flowsOf(data, proofs),
    arrivalsByDay: arrivals(data, proofs),
    companies: data.companies,
  };
}
