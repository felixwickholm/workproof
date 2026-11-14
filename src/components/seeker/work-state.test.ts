import { describe, expect, it } from "vitest";
import type { Meeting, PassportEntry } from "@/lib/domain/types";
import { bestTotal, workState } from "./work-state";

type Response = PassportEntry["responses"][number];
const event = { id: "c", title: "t", minutes: 10, format: "make" as const, kind: "event" as const };
const meeting = (status: Meeting["status"]): Meeting => ({ id: "m", proofId: "p", companyId: "c", slot: "Sat 13:15", status, talentConfirmedMet: false, companyConfirmedMet: false });
const response = (patch: Partial<Response>): Response => ({ companyName: "Kaari", reviewer: "Anna", decision: "hold", feedback: "Good work.", viaSecondLook: false, ...patch });

describe("work state", () => {
  it("waits for a score until a person answers", () => {
    expect(workState({ challenge: event, responses: [] })).toBe("Waits for a score");
    expect(workState({ challenge: { ...event, kind: "taster" }, responses: [] })).toBe("Practice");
  });

  it("shows the best score with one decimal", () => {
    const responses = [response({ total: 7 }), response({ total: 8.5 })];
    expect(bestTotal(responses)).toBe(8.5);
    expect(workState({ challenge: event, responses })).toBe("Scored 8.5 of 10");
    expect(workState({ challenge: event, responses: [response({ total: 9 })] })).toBe("Scored 9.0 of 10");
  });

  it("puts the meeting before the score", () => {
    expect(workState({ challenge: event, responses: [response({ decision: "meet", total: 9 })] })).toBe("Invited");
    expect(workState({ challenge: event, responses: [response({ decision: "meet", meeting: meeting("accepted") })] })).toBe("You said yes");
    expect(workState({ challenge: event, responses: [response({ decision: "meet", meeting: meeting("declined") })] })).toBe("Not now");
    expect(workState({ challenge: event, responses: [response({ decision: "meet", meeting: meeting("met") })] })).toBe("You met");
  });
});
