import { describe, expect, it } from "vitest";
import { dayGreeting, greetingLine, homeFact } from "./greeting";

describe("seeker greeting", () => {
  it("names the time of day from the hour", () => {
    expect(dayGreeting(5)).toBe("Good morning");
    expect(dayGreeting(11)).toBe("Good morning");
    expect(dayGreeting(12)).toBe("Good afternoon");
    expect(dayGreeting(17)).toBe("Good afternoon");
    expect(dayGreeting(18)).toBe("Good evening");
    expect(dayGreeting(2)).toBe("Good evening");
  });

  it("greets by first name, or without one before the person has given a name", () => {
    expect(greetingLine("Olena", "Kaari Home Care invited you.", 20)).toBe("Good evening, Olena. Kaari Home Care invited you.");
    expect(greetingLine(null, "12 challenges are open.", 9)).toBe("Good morning. 12 challenges are open.");
  });

  it("says an open invitation first, then the open challenges", () => {
    expect(homeFact([{ companyName: "Kaari Home Care", status: "invited" }], 12)).toBe("Kaari Home Care invited you.");
    expect(homeFact([{ companyName: "Kaari Home Care", status: "accepted" }], 12)).toBe("12 challenges are open.");
    expect(homeFact([], 1)).toBe("1 challenge is open.");
    expect(homeFact([], 0)).toBe("No challenge is open right now.");
  });
});
