import type { CityOverview, Company, EmployerRecord } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { median } from "../reply-totals";
import { DAY_MS, eventChallenges, eventTotals, HOUR_MS } from "./event";
import { buildCityInsights } from "./insights";
import { ownChallenges } from "./queue";

/** One employer's record for the city: did they answer, how fast, and did they meet anyone. */
export function employerRecord(data: StoreData, company: Company): EmployerRecord {
  const own = ownChallenges(data, company.id);
  const ownIds = new Set(own.map((c) => c.id));
  const received = data.proofs.filter((p) => ownIds.has(p.challengeId));
  const decisions = data.decisions.filter((d) => d.companyId === company.id);
  const decidedIds = new Set(decisions.map((d) => d.proofId));
  const submittedAt = new Map(data.proofs.map((p) => [p.proofId, p.submittedAt]));

  const eventDay = new Date(`${data.event.date}T00:00:00Z`).getTime();
  const firstLive = Math.min(...own.map((c) => new Date(c.createdAt).getTime()));
  const liveDays = own.length ? Math.max(0, Math.floor((eventDay - firstLive) / DAY_MS)) : 0;

  return {
    company,
    challengeLiveDaysBeforeEvent: liveDays,
    proofsReceived: received.length,
    feedbackGiven: decisions.length,
    feedbackOwed: received.filter((p) => !decidedIds.has(p.proofId)).length,
    medianHoursToRespond: median(
      decisions.map((d) => (new Date(d.decidedAt).getTime() - new Date(submittedAt.get(d.proofId) ?? d.decidedAt).getTime()) / HOUR_MS),
    ),
    meetingsHeld: data.meetings.filter((m) => m.companyId === company.id && m.status === "met").length,
  };
}

/** Outcomes for the city. Decisions are only ever made by people, so automated decisions are 0 by type. */
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
      automatedDecisions: 0,
    },
    employers: data.companies.map((company) => employerRecord(data, company)),
    audit: [...data.audit].sort((a, b) => b.at.localeCompare(a.at)),
    insights: buildCityInsights(data),
  };
}
