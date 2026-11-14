import { checkFeedback } from "@/lib/domain/feedback-check";
import { totalOf } from "@/lib/domain/scoring";
import type { Meeting, Skill, SkillScore, TaskCounts, TaskFormat, TopProof } from "@/lib/domain/types";

/** How a challenge is done, as a company reads it. */
const FORMAT_WORDS: Record<TaskFormat, string> = { choose: "Choose", make: "Make", fix: "Fix", read: "Read" };

export function formatWord(format: TaskFormat): string {
  return FORMAT_WORDS[format];
}

/** "Make · 12 min": the shape of a challenge in one short line. */
export function challengeShape(challenge: { format: TaskFormat; minutes: number }): string {
  return `${formatWord(challenge.format)} · ${challenge.minutes} min`;
}

/** The four steps a company follows on one challenge, as number and words, in order. */
export function funnelSteps(counts: TaskCounts): { count: number; words: string }[] {
  return [
    { count: counts.took, words: "did it" },
    { count: counts.scored, words: "scored" },
    { count: counts.invited, words: "invited" },
    { count: counts.agreed, words: "said yes" },
  ];
}

/** "9 did it → 4 scored → 2 invited → 1 said yes". */
export function funnelLine(counts: TaskCounts): string {
  return funnelSteps(counts)
    .map((s) => `${s.count} ${s.words}`)
    .join(" → ");
}

/** A total out of 10, always with one decimal so a list of totals lines up: "7.5", "8.0". */
export function formatTotal(total: number): string {
  return total.toFixed(1);
}

/** "7.5 of 10". */
export function totalOutOf(total: number): string {
  return `${formatTotal(total)} of 10`;
}

/** The total while a reviewer scores: a number only once every skill has points, else null. */
export function liveTotal(points: Readonly<Record<string, SkillScore["points"] | undefined>>, skills: readonly Pick<Skill, "id">[]): number | null {
  const given = skills.flatMap((s) => (points[s.id] ? [{ points: points[s.id] as number }] : []));
  return given.length === 0 || given.length < skills.length ? null : totalOf(given);
}

/** "2 of 5 skills scored": shown where the total will be, until every skill has points. */
export function scoredSoFar(points: Readonly<Record<string, SkillScore["points"] | undefined>>, skills: readonly Pick<Skill, "id">[]): string {
  return `${skills.filter((s) => points[s.id]).length} of ${skills.length} skills scored`;
}

/** The rule printed while the score cannot be sent. */
export const SCORE_RULE = "Score every skill and write two sentences.";

/**
 * Whether the score can be sent, and what still waits, in words. The name is checked apart, by the
 * reviewer step, because adding a reviewer is its own action.
 */
export function scoreLock(
  points: Readonly<Record<string, SkillScore["points"] | undefined>>,
  skills: readonly Pick<Skill, "id">[],
  reviewer: string,
  reason: string,
): { locked: boolean; waitingFor: string | null } {
  const missing = skills.filter((s) => !points[s.id]).length;
  if (missing > 0) return { locked: true, waitingFor: missing === skills.length ? SCORE_RULE : `Score ${missing} more ${missing === 1 ? "skill" : "skills"}.` };
  const check = checkFeedback(reviewer, reason);
  return { locked: check.waitingFor !== null, waitingFor: check.waitingFor };
}

/** The scores in the challenge's skill order, once every skill has points. */
export function scoresFor(points: Readonly<Record<string, SkillScore["points"] | undefined>>, skills: readonly Pick<Skill, "id">[]): SkillScore[] {
  return skills.flatMap((s) => {
    const p = points[s.id];
    return p ? [{ skillId: s.id, points: p }] : [];
  });
}

/** "Proof K7" from the server reads "Work K7" on the company's screens: the plain word is work. */
export function workLabel(label: string): string {
  return label.replace(/^Proof\b/, "Work");
}

/** "K7": the code alone, for "K7 is Olena Kovalenko". */
export function workCode(label: string): string {
  return label.replace(/^(Proof|Work)\s+/, "");
}

/** The table and time of a meeting slot in plain words: "Sat 13:15, Table 2" reads "table 2, Sat 13:15". */
function slotWords(slot: string): string {
  const [time, table] = slot.split(/,\s*/);
  return table ? `${table.toLowerCase()}, ${time}` : slot.toLowerCase();
}

/** Where one meeting stands, from the company's side. */
export function meetingState(meeting: Meeting): string {
  if (meeting.hired) return "Hired";
  if (meeting.followUpAgreed) return "Met · follow-up agreed";
  if (meeting.status === "met") return "Met at the event";
  if (meeting.status === "accepted") return `Said yes · meet at the event, ${slotWords(meeting.slot)}`;
  if (meeting.status === "declined") return "Invited · the person said no";
  return "Invited · waiting for the person";
}

/** One scored row's state in words: what happened, and what the company does next. */
export function rowState(row: Pick<TopProof, "decision" | "meeting">): string {
  if (row.meeting) return meetingState(row.meeting);
  if (row.decision.decision === "pass") return "Not now";
  if (row.decision.decision === "meet") return "Invited · waiting for the person";
  return "Scored · decide";
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The greeting from the data: "Halla Supply. 5 people did your challenge. 3 wait for a score." */
export function greetingLine(companyName: string, took: number, waiting: number): string {
  if (took === 0) return `${companyName}. No one did your challenge yet.`;
  const did = `${plural(took, "person", "people")} did your challenge.`;
  const wait = waiting === 0 ? "All work has a score." : `${waiting} ${waiting === 1 ? "waits" : "wait"} for a score.`;
  return `${companyName}. ${did} ${wait}`;
}

/** Hours in the shortest plain form: "under 1 h", "2 h", "3 days". */
export function hoursWords(hours: number): string {
  if (hours < 1) return "under 1 h";
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
}

/** The quiet facts line under the list. Empty parts are left out, never shown as a dash. */
export function factsLine(medianHours: number | null, owed: number): string {
  const parts: string[] = [];
  if (medianHours !== null) parts.push(`Median time to score: ${hoursWords(medianHours)}.`);
  parts.push(`Answers you still owe: ${owed}.`);
  return parts.join(" ");
}

/** The five steps of the event, in order. */
export const EVENT_STEPS = [
  "The challenge opens before the event.",
  "You score the work.",
  "You invite the top people.",
  "You talk at the event.",
  "You agree a follow-up.",
] as const;

/**
 * The step the company is on, 1 to 5: the first one not done yet. A challenge is open (1 done) once any
 * work came in; a score finishes 2; an invitation 3; a talk both confirmed 4.
 */
export function currentEventStep(totals: { took: number; scored: number; invited: number; met: number }): number {
  if (totals.took === 0) return 1;
  if (totals.scored === 0) return 2;
  if (totals.invited === 0) return 3;
  if (totals.met === 0) return 4;
  return 5;
}
