import type { EmployerHome } from "@/lib/domain/types";

/** The greeting h1: the company, then the one fact the server picked from today's data. */
export function greetingTitle(companyName: string, fact: string): string {
  return `${companyName}. ${fact}`;
}

/** "3 h", "under 1 h" or "2 days", for a median reply or a time to meet. Null stays null. */
export function hoursText(hours: number | null): string | null {
  if (hours === null) return null;
  if (hours < 1) return "under 1 h";
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
}

/** "Live since today", "Live for 1 day", "Live for 5 days". */
export function liveFor(days: number): string {
  if (days < 1) return "Live since today";
  return `Live for ${days} ${days === 1 ? "day" : "days"}`;
}

/** Proofs waiting in the company's own queue: everything it can read, minus Second look. */
export function ownWaiting(counts: EmployerHome["counts"], secondLookWaiting: number): number {
  return Math.max(0, counts.waiting - secondLookWaiting);
}

/** The line under the queue preview when other employers' work waits through Second look. */
export function secondLookLine(count: number): string | null {
  if (count <= 0) return null;
  return `${count} more through Second look: work another employer could not use, with the person's consent.`;
}

/** "First meeting 60 h after the task went live", or null before the first Meet. */
export function firstMeetingLine(hours: number | null): string | null {
  const text = hoursText(hours);
  return text ? `First meeting ${text} after the task went live` : null;
}

/** The event's own answer record, so a company can judge the service, not only its own queue. */
export function eventLine(event: EmployerHome["event"]): string {
  const reply = hoursText(event.medianHoursToFirstAnswer);
  const answered = `At this event: ${event.proofsAnswered} of ${event.proofs} proofs have a written reason.`;
  return reply ? `${answered} Median reply ${reply}.` : answered;
}

/** Accepted and met meetings, from the pipeline, for the Meetings tile caption. */
export function meetingsCaption(pipeline: EmployerHome["pipeline"]): string {
  const count = (stage: string) => pipeline.find((p) => p.stage === stage)?.count ?? 0;
  return `${count("Accepted")} accepted · ${count("Met")} met`;
}

/**
 * How wide a skill's bar is: its proofs out of every proof at the event, so a bar is a true share
 * of the whole pool and never stretched to look full. Always visible when there is at least one.
 */
export function poolShare(proofs: number, eventProofs: number): number {
  if (proofs <= 0 || eventProofs <= 0) return 0;
  return Math.max(2, Math.min(100, (proofs / eventProofs) * 100));
}

/** "25 min", "3 h", "2 days": how long something has waited, from its arrival to now. */
export function waitedText(sinceIso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - Date.parse(sinceIso)) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.floor(hours / 24)} days`;
}

/**
 * The event's answer window in hours: after it, with the person's consent, unanswered work can
 * go to another employer. Null while the server does not send it with the event totals.
 */
export function answerWindowHours(event: object): number | null {
  return "responseWindowHours" in event && typeof event.responseWindowHours === "number" ? event.responseWindowHours : null;
}

/** "Oldest has waited 3 h. Answer window: 48 h." Null when nothing waits. */
export function oldestWaitLine(oldestIso: string | undefined, now: number, windowHours: number | null): string | null {
  if (!oldestIso) return null;
  const waited = `Oldest has waited ${waitedText(oldestIso, now)}.`;
  return windowHours === null ? waited : `${waited} Answer window: ${windowHours} h.`;
}

/** The rule a company accepts by publishing a task, with the window when it is known. */
export function answerWindowRule(windowHours: number | null): string {
  const after = "with the person's consent, the work can go to another employer.";
  return windowHours === null ? `After the answer window, ${after}` : `Answer window: ${windowHours} hours. After that, ${after}`;
}

/**
 * The pool's headline: the skill the most proofs here were handed in for, as a count and a
 * sentence. About skills and work only; null when no proof matches any skill yet.
 */
export function poolLead(pool: EmployerHome["pool"]): { proofs: number; text: string } | null {
  const top = pool.reduce<EmployerHome["pool"][number] | null>((best, skill) => (skill.proofs > (best?.proofs ?? 0) ? skill : best), null);
  if (!top) return null;
  const noun = top.proofs === 1 ? "proof here was" : "proofs here were";
  return { proofs: top.proofs, text: `${noun} handed in for tasks that ask for ${top.label}, one of your skills.` };
}

/** The pipeline from the first answer on. "To read" is left out: the tiles already count it. */
export function afterReading(pipeline: EmployerHome["pipeline"]): EmployerHome["pipeline"] {
  return pipeline.filter((p) => p.stage !== "To read");
}

/** "About 24 min of reading waits for you.", or null when nothing waits. An estimate, stated as one. */
export function readingOwedLine(minutes: number): string | null {
  if (minutes <= 0) return null;
  return `About ${Math.round(minutes)} min of reading waits for you.`;
}

/** "7 of 12 places left" on a task row, or "Full: all 12 answers are in". */
export function taskPlacesLine(left: number, places: number): string {
  if (left <= 0) return `Full: all ${places} answers are in`;
  return `${left} of ${places} ${places === 1 ? "place" : "places"} left`;
}
