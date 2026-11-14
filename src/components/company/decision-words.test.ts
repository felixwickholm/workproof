import { describe, expect, it } from "vitest";
import type { Decision, Meeting } from "@/lib/domain/types";
import { decidedLine, decisionLabel, meetingWords, nameShown, newestFirst, type DecidedEntry } from "./decision-words";

const decision = (kind: Decision["decision"], decidedAt = "2026-11-14T08:00:00.000Z"): Decision => ({
  id: `d-${decidedAt}`,
  proofId: "p1",
  companyId: "co-kaari",
  reviewer: "Anna Koivisto",
  decision: kind,
  feedback: "You saw the blood thinner risk. I want to hear more.",
  decidedAt,
});

const meeting = (patch: Partial<Meeting> = {}): Meeting => ({
  id: "m1",
  proofId: "p1",
  companyId: "co-kaari",
  slot: "Sat 13:00, Table 1",
  status: "invited",
  talentConfirmedMet: false,
  companyConfirmedMet: false,
  ...patch,
});

describe("decisionLabel", () => {
  it("uses the two decision words only", () => {
    expect(decisionLabel({ decision: decision("meet") })).toBe("Meet");
    expect(decisionLabel({ decision: decision("pass") })).toBe("Not now");
  });
});

describe("meetingWords", () => {
  it("follows the meeting from invitation to met", () => {
    expect(meetingWords(undefined)).toBe("written answer sent");
    expect(meetingWords(meeting())).toBe("invited, name hidden");
    expect(meetingWords(meeting({ status: "accepted" }))).toBe("accepted");
    expect(meetingWords(meeting({ status: "declined" }))).toBe("declined, name hidden");
    expect(meetingWords(meeting({ status: "accepted", companyConfirmedMet: true }))).toBe("you confirmed you met");
    expect(meetingWords(meeting({ status: "met", companyConfirmedMet: true, talentConfirmedMet: true }))).toBe("met, confirmed by both");
  });
});

describe("decidedLine", () => {
  it("joins the decision and the meeting state", () => {
    expect(decidedLine({ decision: decision("pass") })).toBe("Not now · written answer sent");
    expect(decidedLine({ decision: decision("meet"), meeting: meeting({ status: "accepted" }) })).toBe("Meet · accepted");
    expect(decidedLine({ decision: decision("pass"), withdrawn: true })).toBe("Not now · written answer sent · withdrawn from Second look");
  });
});

describe("nameShown", () => {
  const identity = { name: "Olena Kovalenko", contact: "olena.kovalenko@example.org" };

  it("shows the name only after the person accepted", () => {
    expect(nameShown({ meeting: meeting(), identity })).toBe(false);
    expect(nameShown({ meeting: meeting({ status: "accepted" }), identity })).toBe(true);
    expect(nameShown({ meeting: meeting({ status: "accepted" }) })).toBe(false);
    expect(nameShown({ meeting: meeting({ status: "declined" }), identity })).toBe(false);
  });
});

describe("newestFirst", () => {
  it("puts the latest decision on top without changing the input", () => {
    const entries = [
      { proof: {} as DecidedEntry["proof"], decision: decision("pass", "2026-11-13T08:00:00.000Z") },
      { proof: {} as DecidedEntry["proof"], decision: decision("meet", "2026-11-14T08:00:00.000Z") },
    ];
    expect(newestFirst(entries).map((e) => e.decision.decision)).toEqual(["meet", "pass"]);
    expect(entries[0].decision.decision).toBe("pass");
  });
});
