import { describe, expect, it } from "vitest";
import { dayGreeting, greetingLine, homeCountLine } from "./greeting";

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
    expect(greetingLine("Olena", "Kaari Home Care wants to meet you.", 9)).toBe("Good morning, Olena. Kaari Home Care wants to meet you.");
    expect(greetingLine(null, "Fourteen tasks are open today.", 9)).toBe("Good morning. Fourteen tasks are open today.");
  });

  it("puts the four counts in one grey line", () => {
    expect(homeCountLine({ proofs: 3, readByPeople: 2, writtenAnswers: 2, invitations: 1 })).toBe(
      "3 proofs handed in · 2 read by a person · 2 written reasons · 1 invitation",
    );
    expect(homeCountLine({ proofs: 1, readByPeople: 0, writtenAnswers: 1, invitations: 0 })).toBe(
      "1 proof handed in · 0 read by a person · 1 written reason · 0 invitations",
    );
  });
});
