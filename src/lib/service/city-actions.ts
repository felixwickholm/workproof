import { approveRequest } from "@/lib/http/schemas";
import type { MeetingStatus } from "@/lib/domain/types";
import { getStore, type StoreData } from "@/lib/store";
import { clock } from "./support";
import { HOUR_MS } from "./views/event";
import { ownChallenges } from "./views/queue";

/**
 * What the event organiser can do from the city view: draft a reminder to an employer that still
 * owes answers, and export the meeting list for the event's own meeting tool. Pure functions over
 * one event; nothing here sends a message or changes the event.
 */

/** The event's own rules, read from the data and the task schema, never typed twice. */
export interface EventRules {
  /** Hours an employer has to answer before, with consent, the work can go to another employer. */
  responseWindowHours: number;
  /** The longest task a company can publish. */
  maxTaskMinutes: number;
}

/** The longest task the schema accepts, so the city card and the server always agree. */
export const MAX_TASK_MINUTES: number = approveRequest.shape.draft.shape.minutes.maxValue ?? 30;

export function eventRules(data: StoreData): EventRules {
  return { responseWindowHours: data.event.responseWindowHours, maxTaskMinutes: MAX_TASK_MINUTES };
}

/** One task of an employer with proofs that still wait for its written answer. */
export interface OwedTask {
  title: string;
  waiting: number;
}

/** One employer that owes answers, with what a reminder needs to say. Counts and titles only, never a person. */
export interface OwedReminder {
  companyId: string;
  companyName: string;
  tasks: OwedTask[];
  waiting: number;
  /** Hours the oldest waiting proof has waited. */
  oldestHours: number;
  /** ISO time the reminder asks for an answer by. */
  answerBy: string;
}

/**
 * The answer-by time: the end of the answer window for the oldest waiting proof. When that time has
 * passed, one day from now, so a reminder never asks for an answer in the past.
 */
export function answerByTime(oldestSubmittedAt: Date, windowHours: number, now: Date): Date {
  const windowEnd = oldestSubmittedAt.getTime() + windowHours * HOUR_MS;
  return new Date(windowEnd > now.getTime() ? windowEnd : now.getTime() + 24 * HOUR_MS);
}

/** Every employer with proofs on its own tasks and no written answer from it yet, most waiting first. */
export function owedReminders(data: StoreData, now: Date): OwedReminder[] {
  const reminders = data.companies.flatMap((company): OwedReminder[] => {
    const answered = new Set(data.decisions.filter((d) => d.companyId === company.id).map((d) => d.proofId));
    const tasks = ownChallenges(data, company.id).map((challenge) => ({
      title: challenge.title,
      proofs: data.proofs.filter((p) => p.challengeId === challenge.id && !answered.has(p.proofId)),
    }));
    const waiting = tasks.flatMap((t) => t.proofs);
    if (waiting.length === 0) return [];
    const oldest = new Date(Math.min(...waiting.map((p) => new Date(p.submittedAt).getTime())));
    return [
      {
        companyId: company.id,
        companyName: company.name,
        tasks: tasks.filter((t) => t.proofs.length > 0).map((t) => ({ title: t.title, waiting: t.proofs.length })),
        waiting: waiting.length,
        oldestHours: Math.max(0, (now.getTime() - oldest.getTime()) / HOUR_MS),
        answerBy: answerByTime(oldest, data.event.responseWindowHours, now).toISOString(),
      },
    ];
  });
  return reminders.sort((a, b) => b.waiting - a.waiting || b.oldestHours - a.oldestHours || a.companyName.localeCompare(b.companyName));
}

/** "less than an hour", "1 hour", "26 hours". */
export function hoursInWords(hours: number): string {
  if (hours < 1) return "less than an hour";
  const whole = Math.round(hours);
  return whole === 1 ? "1 hour" : `${whole} hours`;
}

/** "your task “A”", "your tasks “A” and “B”", "your tasks “A”, “B” and “C”". */
function tasksInWords(tasks: readonly OwedTask[]): string {
  const titles = tasks.map((t) => `“${t.title}”`);
  if (titles.length <= 1) return `your task ${titles[0] ?? ""}`.trim();
  return `your tasks ${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}

/** The time in the event's own time zone, for example "Sun 15 Nov, 14:00". */
export function eventTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Helsinki",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("weekday")} ${part("day")} ${part("month")}, ${part("hour")}:${part("minute")}`;
}

/** The reminder an organiser can copy into their own mail. Plain text, editable, never sent by Workprint. */
export function reminderText(reminder: OwedReminder): string {
  const people = reminder.waiting === 1 ? "1 person handed in work" : `${reminder.waiting} people handed in work`;
  const wait = reminder.waiting === 1 ? "waits" : "wait";
  const oldest = reminder.waiting === 1 ? "They have waited" : "The oldest has waited";
  return [
    `Hello ${reminder.companyName},`,
    "",
    `${people} for ${tasksInWords(reminder.tasks)} and ${wait} for a written answer. ${oldest} ${hoursInWords(reminder.oldestHours)}.`,
    "",
    `Workprint shows the city which answers are still owed. Please answer by ${eventTime(reminder.answerBy)}.`,
  ].join("\n");
}

/** One row of the meeting export. The name is set only once the person accepted the meeting. */
interface MeetingRow {
  proofLabel: string;
  employer: string;
  slot: string;
  status: string;
  name: string;
}

/** Meetings the export lists, in the order a table plan reads them. A declined invitation is not a meeting. */
const EXPORTED: Partial<Record<MeetingStatus, { order: number; words: string }>> = {
  met: { order: 0, words: "Met, both sides confirmed" },
  accepted: { order: 1, words: "Accepted" },
  invited: { order: 2, words: "Invited, waiting for the person" },
};

/** The person accepted, so the employer already sees the name and the organiser can book the table. */
const NAME_SHOWN: ReadonlySet<MeetingStatus> = new Set(["accepted", "met"]);

export function meetingRows(data: StoreData): MeetingRow[] {
  const rows = data.meetings.flatMap((meeting) => {
    const status = EXPORTED[meeting.status];
    if (!status) return [];
    const proof = data.proofs.find((p) => p.proofId === meeting.proofId);
    const company = data.companies.find((c) => c.id === meeting.companyId);
    const submission = data.submissions.find((s) => s.id === meeting.proofId);
    const talent = NAME_SHOWN.has(meeting.status) ? data.talents.find((t) => t.id === submission?.talentId) : undefined;
    const row: MeetingRow = {
      proofLabel: proof?.label ?? "",
      employer: company?.name ?? "",
      slot: meeting.slot,
      status: status.words,
      name: talent?.name ?? "",
    };
    return [{ row, order: status.order }];
  });
  return rows
    .sort((a, b) => a.order - b.order || a.row.employer.localeCompare(b.row.employer) || a.row.slot.localeCompare(b.row.slot))
    .map(({ row }) => row);
}

/**
 * One CSV cell. Quotes, commas and line breaks are quoted; a cell that a spreadsheet would read as a
 * formula (= + - @, tab, return) gets a leading apostrophe, so an imported file never runs anything.
 */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

const MEETINGS_CSV_HEADER = ["Proof", "Employer", "Table and time", "Status", "Name"] as const;

/** The meeting list as CSV for the event's meeting tool, with a header row and CRLF line ends. */
export function meetingsCsv(data: StoreData): string {
  const lines = [
    MEETINGS_CSV_HEADER.join(","),
    ...meetingRows(data).map((r) => [r.proofLabel, r.employer, r.slot, r.status, r.name].map(csvCell).join(",")),
  ];
  return `${lines.join("\r\n")}\r\n`;
}

/** The organiser's side of the city view: who to remind, and the rules the event runs on. */
export interface CityActions {
  reminders: (OwedReminder & { text: string })[];
  rules: EventRules;
}

export function buildCityActions(data: StoreData, now: Date): CityActions {
  return { reminders: owedReminders(data, now).map((r) => ({ ...r, text: reminderText(r) })), rules: eventRules(data) };
}

export async function cityActions(): Promise<CityActions> {
  return buildCityActions(await getStore().read(), clock.now());
}
