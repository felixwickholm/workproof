import { placesLeft, placesOf, readingMinutes } from "@/lib/domain/places";
import type { EmployerHome } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";
import { employerRecord } from "./city";
import { DAY_MS, eventChallenges, eventTotals, hoursBetween } from "./event";
import { buildQueue, ownChallenges } from "./queue";
import { isScored, topTotalOf } from "./leaderboard";
import { counted } from "./words";

const PREVIEW = 5;

/** Today's one fact: proofs to read, else meetings to hold, else that everyone has an answer. */
function greetingFact(waiting: number, booked: number): string {
  if (waiting > 0) return `${counted(waiting, "proof", { one: "waits", many: "wait" })} for a reader.`;
  if (booked > 0) return `${counted(booked, "meeting", { one: "is", many: "are" })} booked.`;
  return "Every proof has an answer.";
}

/** For each core skill this company asks for: event proofs handed in for any task that carries it. Counts only. */
function talentPool(data: StoreData, companyId: string): EmployerHome["pool"] {
  const tasks = eventChallenges(data);
  const proofsFor = new Map<string, number>();
  for (const p of data.proofs) proofsFor.set(p.challengeId, (proofsFor.get(p.challengeId) ?? 0) + 1);
  const asked = new Map<string, string>();
  for (const c of ownChallenges(data, companyId)) for (const s of c.coreSkills) if (!asked.has(s.id)) asked.set(s.id, s.label);
  return [...asked]
    .map(([skillId, label]) => ({
      skillId,
      label,
      proofs: tasks.filter((c) => c.coreSkills.some((s) => s.id === skillId)).reduce((sum, c) => sum + (proofsFor.get(c.id) ?? 0), 0),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** An employer's home: what waits, what they owe, and how the event is going. Blind proofs and counts only. */
export function buildEmployerHome(data: StoreData, companyId: string, now: Date): EmployerHome {
  const queue = buildQueue(data, companyId, now);
  const record = employerRecord(data, queue.company);
  const meetings = data.meetings.filter((m) => m.companyId === companyId);
  const decisions = data.decisions.filter((d) => d.companyId === companyId);
  const own = ownChallenges(data, companyId);
  const waiting = queue.proofs.length + queue.secondLook.length;
  const accepted = meetings.filter((m) => m.status === "accepted" || m.status === "met").length;
  const met = meetings.filter((m) => m.status === "met").length;
  const meets = decisions.filter((d) => d.decision === "meet").sort((a, b) => a.decidedAt.localeCompare(b.decidedAt));
  const taskOf = new Map(data.proofs.map((p) => [p.proofId, p.challengeId]));
  /** From the task going live to this company's first Meet decision on a proof sent to that task. */
  const hoursToFirstInvitation = (challengeId: string, createdAt: string) => {
    const first = meets.find((d) => taskOf.get(d.proofId) === challengeId);
    return first ? hoursBetween(createdAt, first.decidedAt) : null;
  };

  return {
    company: queue.company,
    greeting: { fact: greetingFact(waiting, accepted - met) },
    counts: {
      waiting,
      feedbackOwed: record.proofsOwed,
      medianHoursToRespond: record.medianHoursToRespond,
      meetings: meetings.length,
    },
    tasks: [...own].reverse().map((challenge) => {
      const received = data.proofs.filter((p) => p.challengeId === challenge.id);
      return {
        challenge,
        proofsReceived: received.length,
        waiting: queue.proofs.filter((p) => p.challengeId === challenge.id).length,
        daysLive: Math.max(0, Math.floor((now.getTime() - new Date(challenge.createdAt).getTime()) / DAY_MS)),
        places: placesOf(challenge) ?? 0,
        placesLeft: placesLeft(challenge, received.length) ?? 0,
        hoursToFirstInvitation: hoursToFirstInvitation(challenge.id, challenge.createdAt),
        scored: decisions.filter((d) => isScored(d) && taskOf.get(d.proofId) === challenge.id).length,
        topTotal: topTotalOf(data, challenge.id),
      };
    }),
    readingMinutesOwed: readingMinutes(waiting),
    queuePreview: queue.proofs.slice(0, PREVIEW),
    secondLookWaiting: queue.secondLook.length,
    pipeline: [
      { stage: "To read", count: waiting },
      { stage: "Answered", count: decisions.length },
      { stage: "Invited", count: meetings.length },
      { stage: "Accepted", count: accepted },
      { stage: "Met", count: met },
    ],
    hoursToFirstMeeting: meets[0] && own[0] ? hoursBetween(own[0].createdAt, meets[0].decidedAt) : null,
    pool: talentPool(data, companyId),
    unclaimed: own
      .filter((c) => c.onBehalf && !c.claimedAt)
      .map((challenge) => ({ challenge, proofs: data.proofs.filter((p) => p.challengeId === challenge.id).length })),
    event: { ...eventTotals(data), responseWindowHours: data.event.responseWindowHours },
  };
}
