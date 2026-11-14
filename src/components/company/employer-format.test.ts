import { describe, expect, it } from "vitest";
import {
  afterReading,
  answerWindowHours,
  answerWindowRule,
  eventLine,
  firstMeetingLine,
  greetingTitle,
  hoursText,
  liveFor,
  meetingsCaption,
  oldestWaitLine,
  ownWaiting,
  poolLead,
  poolShare,
  readingOwedLine,
  secondLookLine,
  taskPlacesLine,
  waitedText,
} from "./employer-format";

describe("greetingTitle", () => {
  it("joins the company and the fact into one sentence pair", () => {
    expect(greetingTitle("Kaari Home Care", "Four proofs wait for a reader.")).toBe("Kaari Home Care. Four proofs wait for a reader.");
  });
});

describe("hoursText", () => {
  it("writes hours, then days from two days on", () => {
    expect(hoursText(0.4)).toBe("under 1 h");
    expect(hoursText(19.4)).toBe("19 h");
    expect(hoursText(60)).toBe("3 days");
  });

  it("keeps a missing value missing", () => {
    expect(hoursText(null)).toBeNull();
  });
});

describe("liveFor", () => {
  it("counts whole days in words", () => {
    expect(liveFor(0)).toBe("Live since today");
    expect(liveFor(1)).toBe("Live for 1 day");
    expect(liveFor(5)).toBe("Live for 5 days");
  });
});

describe("ownWaiting", () => {
  it("takes Second look out of everything waiting", () => {
    expect(ownWaiting({ waiting: 7, feedbackOwed: 4, medianHoursToRespond: 3, meetings: 1 }, 3)).toBe(4);
    expect(ownWaiting({ waiting: 1, feedbackOwed: 0, medianHoursToRespond: null, meetings: 0 }, 3)).toBe(0);
  });
});

describe("secondLookLine", () => {
  it("names the consent and stays away when nothing waits", () => {
    expect(secondLookLine(3)).toBe("3 more through Second look: work another employer could not use, with the person's consent.");
    expect(secondLookLine(0)).toBeNull();
  });
});

describe("firstMeetingLine", () => {
  it("says how long from a live task to the first Meet", () => {
    expect(firstMeetingLine(26)).toBe("First meeting 26 h after the task went live");
    expect(firstMeetingLine(null)).toBeNull();
  });
});

describe("eventLine", () => {
  it("states answers against proofs, with the median reply when known", () => {
    expect(eventLine({ proofs: 47, proofsAnswered: 30, medianHoursToFirstAnswer: 3, responseWindowHours: 48 })).toBe(
      "At this event: 30 of 47 proofs have a written reason. Median reply 3 h.",
    );
    expect(eventLine({ proofs: 2, proofsAnswered: 0, medianHoursToFirstAnswer: null, responseWindowHours: 48 })).toBe("At this event: 0 of 2 proofs have a written reason.");
  });
});

describe("meetingsCaption", () => {
  it("reads accepted and met from the pipeline", () => {
    const pipeline = [
      { stage: "To read" as const, count: 7 },
      { stage: "Answered" as const, count: 5 },
      { stage: "Invited" as const, count: 2 },
      { stage: "Accepted" as const, count: 1 },
      { stage: "Met" as const, count: 0 },
    ];
    expect(meetingsCaption(pipeline)).toBe("1 accepted · 0 met");
  });
});

describe("poolShare", () => {
  it("is the true share of all event proofs", () => {
    expect(poolShare(12, 48)).toBe(25);
  });

  it("keeps one proof visible and zero empty", () => {
    expect(poolShare(0, 48)).toBe(0);
    expect(poolShare(1, 400)).toBe(2);
    expect(poolShare(3, 0)).toBe(0);
  });
});

describe("waitedText", () => {
  const now = Date.parse("2026-11-14T12:00:00.000Z");
  it("writes minutes, then hours, then days from two days on", () => {
    expect(waitedText("2026-11-14T11:35:00.000Z", now)).toBe("25 min");
    expect(waitedText("2026-11-14T09:00:00.000Z", now)).toBe("3 h");
    expect(waitedText("2026-11-11T12:00:00.000Z", now)).toBe("3 days");
  });

  it("never goes below zero for a clock that runs a little behind", () => {
    expect(waitedText("2026-11-14T12:05:00.000Z", now)).toBe("0 min");
  });
});

describe("answerWindowHours", () => {
  it("reads the window when the event carries it", () => {
    expect(answerWindowHours({ proofs: 3, responseWindowHours: 48 })).toBe(48);
  });

  it("is null when the event does not say", () => {
    expect(answerWindowHours({ proofs: 3 })).toBeNull();
    expect(answerWindowHours({ responseWindowHours: "48" })).toBeNull();
  });
});

describe("oldestWaitLine", () => {
  const now = Date.parse("2026-11-14T12:00:00.000Z");
  it("names the oldest wait and the window", () => {
    expect(oldestWaitLine("2026-11-14T09:00:00.000Z", now, 48)).toBe("Oldest has waited 3 h. Answer window: 48 h.");
  });

  it("leaves the window out when it is not known, and says nothing when nothing waits", () => {
    expect(oldestWaitLine("2026-11-14T09:00:00.000Z", now, null)).toBe("Oldest has waited 3 h.");
    expect(oldestWaitLine(undefined, now, 48)).toBeNull();
  });
});

describe("answerWindowRule", () => {
  it("states the window the company accepts by publishing", () => {
    expect(answerWindowRule(48)).toBe("Answer window: 48 hours. After that, with the person's consent, the work can go to another employer.");
    expect(answerWindowRule(null)).toBe("After the answer window, with the person's consent, the work can go to another employer.");
  });
});

describe("poolLead", () => {
  const skill = (label: string, proofs: number) => ({ skillId: label.toLowerCase(), label, proofs });
  it("leads with the skill the most proofs were handed in for", () => {
    expect(poolLead([skill("Prioritisation", 12), skill("Stakeholder communication", 17), skill("Patient safety", 12)])).toEqual({
      proofs: 17,
      text: "proofs here were handed in for tasks that ask for Stakeholder communication, one of your skills.",
    });
  });

  it("says one proof in the singular, and nothing without a match", () => {
    expect(poolLead([skill("SQL", 1)])?.text).toBe("proof here was handed in for tasks that ask for SQL, one of your skills.");
    expect(poolLead([skill("SQL", 0)])).toBeNull();
    expect(poolLead([])).toBeNull();
  });
});

describe("afterReading", () => {
  it("keeps the steps after reading, in order", () => {
    const pipeline = [
      { stage: "To read" as const, count: 6 },
      { stage: "Answered" as const, count: 6 },
      { stage: "Invited" as const, count: 2 },
    ];
    expect(afterReading(pipeline).map((p) => p.stage)).toEqual(["Answered", "Invited"]);
  });
});

describe("readingOwedLine", () => {
  it("says the reading time as an estimate, and nothing when nothing waits", () => {
    expect(readingOwedLine(24)).toBe("About 24 min of reading waits for you.");
    expect(readingOwedLine(0)).toBeNull();
  });
});

describe("taskPlacesLine", () => {
  it("counts the places left, and says when a task is full", () => {
    expect(taskPlacesLine(7, 12)).toBe("7 of 12 places left");
    expect(taskPlacesLine(0, 5)).toBe("Full: all 5 answers are in");
  });
});
