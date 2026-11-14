import { describe, expect, it } from "vitest";
import { greetingLine, inviteNotice } from "./greeting";

describe("seeker greeting", () => {
  it("greets by first name and asks what work they want", () => {
    expect(greetingLine("Mikko")).toBe("Hi Mikko. What work do you want?");
    expect(greetingLine(null)).toBe("What work do you want?");
  });

  it("points to an invite that still needs an answer, and only then", () => {
    expect(inviteNotice([{ companyName: "Halla Supply", status: "invited" }])).toBe("Halla Supply wants to meet you.");
    expect(inviteNotice([{ companyName: "Halla Supply", status: "accepted" }])).toBeNull();
    expect(inviteNotice([])).toBeNull();
  });
});
