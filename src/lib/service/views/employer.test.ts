import { describe, expect, it } from "vitest";
import { buildEmployerHome } from "./employer";
import { eventTotals } from "./event";
import { IDENTITY, NOW, sampleEvent } from "./test-data";

describe("employer home", () => {
  const home = buildEmployerHome(sampleEvent(), "co-halla", NOW);

  it("counts what waits, what is owed and the meetings", () => {
    expect(home.greeting.fact).toBe("Two proofs wait for a reader.");
    expect(home.counts).toEqual({ waiting: 2, feedbackOwed: 1, medianHoursToRespond: 19, meetings: 2 });
    expect(home.secondLookWaiting).toBe(1);
    expect(home.queuePreview.map((p) => p.proofId)).toEqual(["p4"]);
    expect(home.pipeline).toEqual([
      { stage: "To read", count: 2 },
      { stage: "Answered", count: 2 },
      { stage: "Invited", count: 2 },
      { stage: "Accepted", count: 1 },
      { stage: "Met", count: 1 },
    ]);
    expect(home.hoursToFirstMeeting).toBe(72);
  });

  it("measures each task from its own start to the first invitation on it", () => {
    // ch-a went live 9 Nov 00:00 and its first Meet came 12 Nov 00:00. Nobody was invited on ch-pool yet.
    expect(home.tasks.map((t) => [t.challenge.id, t.hoursToFirstInvitation])).toEqual([
      ["ch-pool", null],
      ["ch-a", 72],
    ]);
  });

  it("lists its own live tasks newest first", () => {
    expect(home.tasks.map((t) => [t.challenge.id, t.proofsReceived, t.waiting, t.daysLive])).toEqual([
      ["ch-pool", 1, 1, 4],
      ["ch-a", 2, 0, 5],
    ]);
  });

  it("shows each task's places and an estimate of the reading still owed", () => {
    expect(home.tasks.map((t) => [t.challenge.id, t.places, t.placesLeft])).toEqual([
      ["ch-pool", 12, 11],
      ["ch-a", 12, 10],
    ]);
    expect(home.readingMinutesOwed).toBe(8);
  });

  it("shows the talent pool per core skill and the event totals, as counts only", () => {
    expect(home.pool).toEqual([
      { skillId: "communication", label: "Communication", proofs: 3 },
      { skillId: "planning", label: "Planning", proofs: 3 },
      { skillId: "sql", label: "SQL", proofs: 1 },
      { skillId: "testing", label: "Testing", proofs: 1 },
      { skillId: "triage", label: "Triage", proofs: 3 },
    ]);
    expect(home.event).toEqual({ ...eventTotals(sampleEvent()), responseWindowHours: sampleEvent().event.responseWindowHours });
    expect(home.event.proofs).toBe(4);
    expect(home.event.proofsAnswered).toBe(3);
  });

  it("carries no talent id, name or contact, even with a meeting held", () => {
    const text = JSON.stringify(home);
    for (const value of IDENTITY) expect(text).not.toContain(value);
  });

  it("falls back to booked meetings, then to every proof answered", () => {
    const data = sampleEvent();
    data.proofs = data.proofs.filter((p) => p.proofId !== "p4" && p.proofId !== "p2");
    data.meetings[1].status = "accepted";
    expect(buildEmployerHome(data, "co-halla", NOW).greeting.fact).toBe("One meeting is booked.");
    data.meetings = [];
    expect(buildEmployerHome(data, "co-halla", NOW).greeting.fact).toBe("Every proof has an answer.");
  });
});
