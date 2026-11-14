import { describe, expect, it } from "vitest";
import type { Meeting, TopProof } from "@/lib/domain/types";
import {
  challengeShape,
  factsLine,
  greetingLine,
  liveTotal,
  meetingState,
  rowState,
  SCORE_RULE,
  scoreLock,
  scoredSoFar,
  scoresFor,
} from "./hiring-words";

const skills = [{ id: "a" }, { id: "b" }, { id: "c" }];
const meeting = (over: Partial<Meeting>): Meeting => ({
  id: "m1",
  proofId: "p1",
  companyId: "co",
  slot: "Sat 13:15, Table 2",
  status: "invited",
  talentConfirmedMet: false,
  companyConfirmedMet: false,
  ...over,
});
const decision = (kind: "meet" | "pass" | "hold") => ({ decision: kind }) as TopProof["decision"];

describe("live score", () => {
  it("shows a total only once every skill has points", () => {
    expect(liveTotal({}, skills)).toBeNull();
    expect(liveTotal({ a: 4, b: 5 }, skills)).toBeNull();
    expect(scoredSoFar({ a: 4, b: 5 }, skills)).toBe("2 of 3 skills scored");
    expect(liveTotal({ a: 4, b: 3, c: 5 }, skills)).toBe(8);
    expect(liveTotal({ a: 1, b: 2, c: 1 }, skills)).toBe(2.7);
  });
  it("orders scores by the challenge's skills", () => {
    expect(scoresFor({ c: 5, a: 4 }, skills)).toEqual([
      { skillId: "a", points: 4 },
      { skillId: "c", points: 5 },
    ]);
  });
  it("names the shape of a challenge", () => {
    expect(challengeShape({ format: "fix", minutes: 12 })).toBe("Fix · 12 min");
  });
});

describe("scoreLock", () => {
  const reason = "You kept the insulin visit first and said why. Tell us how you would call the family.";
  it("prints the rule before anything is scored", () => {
    expect(scoreLock({}, skills, "Anna Koivisto", reason)).toEqual({ locked: true, waitingFor: SCORE_RULE });
  });
  it("counts the skills still to score", () => {
    expect(scoreLock({ a: 3, b: 4 }, skills, "Anna Koivisto", reason).waitingFor).toBe("Score 1 more skill.");
  });
  it("needs two sentences after every skill has points", () => {
    expect(scoreLock({ a: 3, b: 4, c: 5 }, skills, "Anna Koivisto", "Good work.").locked).toBe(true);
  });
  it("opens with every skill scored and two sentences", () => {
    expect(scoreLock({ a: 3, b: 4, c: 5 }, skills, "Anna Koivisto", reason)).toEqual({ locked: false, waitingFor: null });
  });
  it("refuses software as the reviewer", () => {
    expect(scoreLock({ a: 3, b: 4, c: 5 }, skills, "AI bot", reason).locked).toBe(true);
  });
});

describe("row state", () => {
  it("says what to do with a scored, undecided work", () => {
    expect(rowState({ decision: decision("hold") })).toBe("Scored · decide");
    expect(rowState({ decision: decision("pass") })).toBe("Not now");
  });
  it("follows the meeting", () => {
    expect(rowState({ decision: decision("meet"), meeting: meeting({}) })).toBe("Invited · waiting for the person");
    expect(rowState({ decision: decision("meet"), meeting: meeting({ status: "accepted" }) })).toBe("Said yes · meet at the event, table 2, Sat 13:15");
    expect(meetingState(meeting({ status: "declined" }))).toBe("Invited · the person said no");
    expect(meetingState(meeting({ status: "met", followUpAgreed: true }))).toBe("Met · follow-up agreed");
  });
});

describe("greeting and facts", () => {
  it("says who did the challenge and what waits", () => {
    expect(greetingLine("Kaari Home Care", 5, 3)).toBe("Kaari Home Care. 5 people did your challenge. 3 wait for a score.");
    expect(greetingLine("Kaari Home Care", 1, 1)).toBe("Kaari Home Care. 1 person did your challenge. 1 waits for a score.");
    expect(greetingLine("Kaari Home Care", 4, 0)).toBe("Kaari Home Care. 4 people did your challenge. All work has a score.");
    expect(greetingLine("Kaari Home Care", 0, 0)).toBe("Kaari Home Care. No one did your challenge yet.");
  });
  it("leaves out an unknown median", () => {
    expect(factsLine(2.2, 3)).toBe("Median time to score: 2 h. Answers you still owe: 3.");
    expect(factsLine(null, 0)).toBe("Answers you still owe: 0.");
    expect(factsLine(0.4, 1)).toBe("Median time to score: under 1 h. Answers you still owe: 1.");
  });
});
