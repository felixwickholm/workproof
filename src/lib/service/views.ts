import type {
  CityOverview,
  Company,
  EmployerRecord,
  PassportEntry,
  ReviewQueue,
  Talent,
} from "@/lib/domain/types";
import { toBlindProof } from "@/lib/blind/project";
import { secondLookMatches } from "@/lib/matching/second-look";
import { getStore, type StoreData } from "@/lib/store";
import { byArrival, clock, findOrThrow } from "./support";

function matchesFor(data: StoreData, proofId: string, now: Date) {
  const submission = data.submissions.find((s) => s.id === proofId);
  const challenge = submission && data.challenges.find((c) => c.id === submission.challengeId);
  if (!submission || !challenge) return [];
  return secondLookMatches({
    submission,
    challenge,
    decisions: data.decisions,
    challenges: data.challenges,
    responseWindowHours: data.event.responseWindowHours,
    now,
  });
}

/** What a company reviewer sees. Only blind proofs, oldest first; identity only after acceptance. */
export function buildQueue(data: StoreData, companyId: string, now: Date): ReviewQueue {
  const company = findOrThrow(data.companies, (c) => c.id === companyId, "Company");
  const challenges = data.challenges
    .filter((c) => c.kind === "event" && c.approvedBy && c.companyIds.includes(companyId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const ownChallengeIds = new Set(challenges.map((c) => c.id));
  const decidedIds = new Set(data.decisions.filter((d) => d.companyId === companyId).map((d) => d.proofId));

  const proofs = data.proofs
    .filter((p) => ownChallengeIds.has(p.challengeId) && !decidedIds.has(p.proofId))
    .sort(byArrival)
    .map(toBlindProof);

  const secondLook = data.proofs
    .filter((p) => !ownChallengeIds.has(p.challengeId) && !decidedIds.has(p.proofId))
    .flatMap((p) => {
      const match = matchesFor(data, p.proofId, now).find((m) => m.companyId === companyId);
      return match ? [{ ...toBlindProof(p), sharedSkills: match.sharedSkills }] : [];
    })
    .sort(byArrival);

  const decided = data.decisions
    .filter((d) => d.companyId === companyId)
    .sort((a, b) => a.decidedAt.localeCompare(b.decidedAt))
    .map((decision) => {
      const proof = findOrThrow(data.proofs, (p) => p.proofId === decision.proofId, "Proof");
      const meeting = data.meetings.find((m) => m.proofId === decision.proofId && m.companyId === companyId);
      let identity: Pick<Talent, "name" | "contact"> | undefined;
      if (meeting && (meeting.status === "accepted" || meeting.status === "met")) {
        const submission = data.submissions.find((s) => s.id === decision.proofId);
        const talent = data.talents.find((t) => t.id === submission?.talentId);
        // Name and contact only. The talent id is the person's private key.
        if (talent) identity = { name: talent.name, contact: talent.contact };
      }
      return { proof: toBlindProof(proof), decision, ...(meeting ? { meeting } : {}), ...(identity ? { identity } : {}) };
    });

  return { company, challenges, proofs, secondLook, decided };
}

/** The person's own proofs, newest first, with every human response they received. */
export function buildPassport(data: StoreData, talentId: string, now: Date): PassportEntry[] {
  const companyName = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "An employer";
  return data.submissions
    .filter((s) => s.talentId === talentId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .flatMap((submission) => {
      const proof = data.proofs.find((p) => p.proofId === submission.id);
      const challenge = data.challenges.find((c) => c.id === submission.challengeId);
      if (!proof || !challenge) return [];
      const decisions = data.decisions.filter((d) => d.proofId === submission.id);
      const responses = decisions.map((d) => {
        const meeting = data.meetings.find((m) => m.proofId === submission.id && m.companyId === d.companyId);
        return {
          companyName: companyName(d.companyId),
          decision: d.decision,
          feedback: d.feedback,
          viaSecondLook: !challenge.companyIds.includes(d.companyId),
          ...(meeting ? { meeting } : {}),
        };
      });
      const shared = new Set([
        ...matchesFor(data, submission.id, now).map((m) => m.companyId),
        ...decisions.filter((d) => !challenge.companyIds.includes(d.companyId)).map((d) => d.companyId),
      ]);
      return [
        {
          proof,
          challenge: { id: challenge.id, title: challenge.title, minutes: challenge.minutes, format: challenge.format },
          seenByHumans: new Set(decisions.map((d) => `${d.companyId}:${d.reviewer.toLowerCase()}`)).size,
          responses,
          sharedWith: [...shared].map(companyName),
        },
      ];
    });
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(value * 10) / 10;
}

function employerRecord(data: StoreData, company: Company): EmployerRecord {
  const own = data.challenges.filter((c) => c.kind === "event" && c.approvedBy && c.companyIds.includes(company.id));
  const ownIds = new Set(own.map((c) => c.id));
  const received = data.proofs.filter((p) => ownIds.has(p.challengeId));
  const decisions = data.decisions.filter((d) => d.companyId === company.id);
  const decidedIds = new Set(decisions.map((d) => d.proofId));
  const submittedAt = new Map(data.proofs.map((p) => [p.proofId, p.submittedAt]));

  const eventDay = new Date(`${data.event.date}T00:00:00Z`).getTime();
  const firstLive = Math.min(...own.map((c) => new Date(c.createdAt).getTime()));
  const liveDays = own.length ? Math.max(0, Math.floor((eventDay - firstLive) / 86_400_000)) : 0;

  return {
    company,
    challengeLiveDaysBeforeEvent: liveDays,
    proofsReceived: received.length,
    feedbackGiven: decisions.length,
    feedbackOwed: received.filter((p) => !decidedIds.has(p.proofId)).length,
    medianHoursToRespond: median(
      decisions.map((d) => (new Date(d.decidedAt).getTime() - new Date(submittedAt.get(d.proofId) ?? d.decidedAt).getTime()) / 3_600_000),
    ),
    meetingsHeld: data.meetings.filter((m) => m.companyId === company.id && m.status === "met").length,
  };
}

/** Outcomes for the city. Decisions are only ever made by people, so automated decisions are 0 by type. */
export function buildCityOverview(data: StoreData): CityOverview {
  const eventChallenges = data.challenges.filter((c) => c.kind === "event" && c.approvedBy);
  const eventIds = new Set(eventChallenges.map((c) => c.id));
  const ownerOf = new Map(eventChallenges.map((c) => [c.id, c.companyIds]));
  const challengeOf = new Map(data.proofs.map((p) => [p.proofId, p.challengeId]));

  return {
    event: { name: data.event.name, date: data.event.date },
    totals: {
      challenges: eventChallenges.length,
      proofs: data.proofs.filter((p) => eventIds.has(p.challengeId)).length,
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
  };
}

export async function getQueue(companyId: string): Promise<ReviewQueue> {
  return buildQueue(await getStore().read(), companyId, clock.now());
}

export async function getPassport(talentId: string): Promise<PassportEntry[]> {
  return buildPassport(await getStore().read(), talentId, clock.now());
}

export async function getCityOverview(): Promise<CityOverview> {
  return buildCityOverview(await getStore().read());
}

export async function listCompanies(): Promise<Company[]> {
  return (await getStore().read()).companies;
}
