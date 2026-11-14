import { describe, expect, it } from "vitest";
import { IDENTITY, NOW, sampleEvent } from "./views/test-data";
import {
  answerByTime,
  buildCityActions,
  csvCell,
  eventRules,
  eventTime,
  hoursInWords,
  MAX_TASK_MINUTES,
  meetingRows,
  meetingsCsv,
  owedReminders,
  reminderText,
  type OwedReminder,
} from "./city-actions";

const HOUR = 3_600_000;

const reminder = (over: Partial<OwedReminder> = {}): OwedReminder => ({
  companyId: "co-kaari",
  companyName: "Kaari Home Care",
  tasks: [{ title: "Plan tomorrow's visits", waiting: 3 }],
  waiting: 3,
  oldestHours: 26.4,
  answerBy: "2026-11-15T12:00:00.000Z",
  ...over,
});

describe("eventRules", () => {
  it("reads the answer window from the event and the task length from the schema", () => {
    expect(eventRules(sampleEvent())).toEqual({ responseWindowHours: 48, maxTaskMinutes: 180 });
    expect(MAX_TASK_MINUTES).toBe(180);
  });
});

describe("owedReminders", () => {
  it("lists each employer with proofs on its own tasks that it has not answered", () => {
    const reminders = owedReminders(sampleEvent(), NOW);
    // p4 on the pooled task waits for both of its employers; Otso answered its only proof.
    expect(reminders.map((r) => r.companyName)).toEqual(["Kaari Home Care", "Kivira Labs"]);
    expect(reminders[0]).toMatchObject({ waiting: 1, tasks: [{ title: "Task ch-pool", waiting: 1 }], oldestHours: 4 });
  });

  it("asks for an answer by the end of the window, or one day from now once it has passed", () => {
    const sent = new Date("2026-11-14T08:00:00.000Z");
    expect(answerByTime(sent, 48, NOW).toISOString()).toBe("2026-11-16T08:00:00.000Z");
    const old = new Date(NOW.getTime() - 60 * HOUR);
    expect(answerByTime(old, 48, NOW).getTime()).toBe(NOW.getTime() + 24 * HOUR);
  });

  it("counts every task with waiting work and never names a person", () => {
    const data = sampleEvent();
    data.decisions = [];
    const kaari = owedReminders(data, NOW).find((r) => r.companyId === "co-kaari")!;
    expect(kaari.waiting).toBe(3);
    expect(kaari.tasks).toEqual([
      { title: "Task ch-a", waiting: 2 },
      { title: "Task ch-pool", waiting: 1 },
    ]);
    expect(JSON.stringify(kaari)).not.toMatch(/Mikko|Sam Example|t_/);
  });
});

describe("reminderText", () => {
  it("says how many people wait, for which task, how long and by when", () => {
    expect(reminderText(reminder())).toBe(
      [
        "Hello Kaari Home Care,",
        "",
        "3 people handed in work for your task “Plan tomorrow's visits” and wait for a written answer. The oldest has waited 26 hours.",
        "",
        "WorkProof shows the city which answers are still owed. Please answer by Sun 15 Nov, 14:00.",
      ].join("\n"),
    );
  });

  it("uses the singular for one person", () => {
    const text = reminderText(reminder({ waiting: 1, oldestHours: 0.5, tasks: [{ title: "A", waiting: 1 }] }));
    expect(text).toContain("1 person handed in work for your task “A” and waits for a written answer. They have waited less than an hour.");
  });

  it("names several tasks in one sentence", () => {
    const tasks = [
      { title: "A", waiting: 1 },
      { title: "B", waiting: 1 },
      { title: "C", waiting: 1 },
    ];
    expect(reminderText(reminder({ tasks }))).toContain("for your tasks “A”, “B” and “C” and wait");
  });
});

describe("hoursInWords and eventTime", () => {
  it("rounds to whole hours", () => {
    expect(hoursInWords(0.2)).toBe("less than an hour");
    expect(hoursInWords(1.4)).toBe("1 hour");
    expect(hoursInWords(2.5)).toBe("3 hours");
  });

  it("writes the time in the event's time zone", () => {
    expect(eventTime("2026-11-14T10:05:00.000Z")).toBe("Sat 14 Nov, 12:05");
  });
});

describe("meeting export", () => {
  it("lists met, accepted and invited meetings by label, employer, time, table and status, never a name", () => {
    const data = sampleEvent();
    data.meetings.push({ id: "m4", proofId: "p2", companyId: "co-otso", slot: "Sat 15:00, Table 4", status: "accepted", talentConfirmedMet: false, companyConfirmedMet: false });
    data.meetings.push({ id: "m5", proofId: "p4", companyId: "co-kivira", slot: "Time to be agreed", status: "invited", talentConfirmedMet: false, companyConfirmedMet: false });
    expect(meetingRows(data)).toEqual([
      { proofLabel: "Proof P3", employer: "Kaari Home Care", time: "Sat 14:00", table: "Table 2", status: "Met, both sides confirmed" },
      { proofLabel: "Proof P2", employer: "Otso Health", time: "Sat 15:00", table: "Table 4", status: "Accepted" },
      { proofLabel: "Proof P1", employer: "Kaari Home Care", time: "Sat 13:00", table: "Table 1", status: "Invited, waiting for the person" },
      { proofLabel: "Proof P4", employer: "Kivira Labs", time: "Time to be agreed", table: "", status: "Invited, waiting for the person" },
    ]);
  });

  it("carries no name, contact or private key at any status, and leaves declined invitations out", () => {
    const data = sampleEvent();
    data.meetings.push({ id: "m4", proofId: "p2", companyId: "co-otso", slot: "Sat 15:00, Table 4", status: "accepted", talentConfirmedMet: false, companyConfirmedMet: false });
    const csv = meetingsCsv(data);
    for (const secret of IDENTITY) expect(csv).not.toContain(secret);
    data.meetings = data.meetings.map((m) => (m.id === "m3" ? { ...m, status: "declined" as const } : m));
    expect(meetingsCsv(data)).not.toContain("Table 2");
  });

  it("starts with a header row and ends every line with CRLF", () => {
    const csv = meetingsCsv(sampleEvent());
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("Proof,Employer,Proposed time,Table,Status");
    expect(lines).toHaveLength(4);
    expect(lines[3]).toBe("");
  });

  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("Sat 13:00, Table 1")).toBe('"Sat 13:00, Table 1"');
    expect(csvCell('The "Kaari" team')).toBe('"The ""Kaari"" team"');
    expect(csvCell("two\nlines")).toBe('"two\nlines"');
    expect(csvCell("Plain")).toBe("Plain");
  });

  it("defuses cells a spreadsheet would read as a formula", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+1")).toBe("'+1");
    expect(csvCell("-1")).toBe("'-1");
    expect(csvCell("@SUM(1)")).toBe("'@SUM(1)");
    expect(csvCell("=A1,B1")).toBe(`"'=A1,B1"`);
  });
});

describe("buildCityActions", () => {
  it("gives each reminder its ready text and the event's rules", () => {
    const actions = buildCityActions(sampleEvent(), NOW);
    expect(actions.rules).toEqual({ responseWindowHours: 48, maxTaskMinutes: 180 });
    expect(actions.reminders[0].text).toBe(reminderText(owedReminders(sampleEvent(), NOW)[0]));
  });
});
