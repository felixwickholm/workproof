import type { CityOverview, Company, EmployerRecord } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { median } from "../reply-totals";
import { countAutomatedDecisions } from "./automated";
import { DAY_MS, eventChallenges, eventTotals, HOUR_MS } from "./event";
import { buildCityInsights } from "./insights";
import { ownChallenges } from "./queue";

/**
 * One employer's record for the city: did they answer the proofs sent to their own tasks, how fast,
 * and did they meet anyone. Second look answers are counted apart, so answered never exceeds received.
 */
export function employerRecord(data: StoreData, company: Company): EmployerRecord {
  const own = ownChallenges(data, company.id);
  const ownIds = new Set(own.map((c) => c.id));
  const received = data.proofs.filter((p) => ownIds.has(p.challengeId));
  const receivedIds = new Set(received.map((p) => p.proofId));
  const decisions = data.decisions.filter((d) => d.companyId === company.id);
  const ownDecisions = decisions.filter((d) => receivedIds.has(d.proofId));
  const answeredIds = new Set(ownDecisions.map((d) => d.proofId));
  const submittedAt = new Map(received.map((p) => [p.proofId, p.submittedAt]));
  const eventDay = new Date(`${data.event.date}T00:00:00Z`).getTime();
  const firstLive = Math.min(...own.map((c) => new Date(c.createdAt).getTime()));
  const liveDays = own.length ? Math.max(0, Math.floor((eventDay - firstLive) / DAY_MS)) : 0;
  return {
    company,
    challengeLiveDaysBeforeEvent: liveDays,
    proofsReceived: received.length,
    proofsAnswered: answeredIds.size,
    proofsOwed: received.length - answeredIds.size,
    secondLookAnswered: decisions.length - ownDecisions.length,
    medianHoursToRespond: median(
      ownDecisions.map((d) => (new Date(d.decidedAt).getTime() - new Date(submittedAt.get(d.proofId) ?? d.decidedAt).getTime()) / HOUR_MS),
    ),
    meetingsHeld: data.meetings.filter((m) => m.companyId === company.id && m.status === "met").length,
  };
}

/** Outcomes for the city. Automated decisions are counted over the decisions and the audit log. */
export function buildCityOverview(data: StoreData): CityOverview {
  const challenges = eventChallenges(data);
  const ownerOf = new Map(challenges.map((c) => [c.id, c.companyIds]));
  const challengeOf = new Map(data.proofs.map((p) => [p.proofId, p.challengeId]));
  const { proofs, proofsAnswered, medianHoursToFirstAnswer } = eventTotals(data);

  return {
    event: { name: data.event.name, date: data.event.date },
    totals: {
      challenges: challenges.length,
      proofs,
      proofsAnswered,
      medianHoursToFirstAnswer,
      humanDecisions: data.decisions.length,
      meetingsInvited: data.meetings.length,
      meetingsConfirmedByBoth: data.meetings.filter((m) => m.status === "met").length,
      secondLookMeetings: data.meetings.filter((m) => {
        const owners = ownerOf.get(challengeOf.get(m.proofId) ?? "") ?? [];
        return !owners.includes(m.companyId);
      }).length,
      automatedDecisions: countAutomatedDecisions(data),
    },
    employers: data.companies.map((company) => employerRecord(data, company)),
    audit: [...data.audit].sort((a, b) => b.at.localeCompare(a.at)),
    insights: buildCityInsights(data),
  };
}
