import { describe, expect, it } from "vitest";
import { acceptLine, bringLine, meetLabel } from "./invitation-words";

describe("invitation words", () => {
  it("names the table on the Meet button, or says Meet when the time is open", () => {
    expect(meetLabel("Sat 13:15, Table 2")).toBe("Meet at Table 2");
    expect(meetLabel("Sat 09:30, Table 11")).toBe("Meet at Table 11");
    expect(meetLabel("Time to be agreed")).toBe("Meet");
  });

  it("says who sees the name, and what the meeting asks", () => {
    expect(acceptLine("Kaari Home Care")).toBe("Accepting shows your name to Kaari Home Care only.");
    expect(bringLine("Anna Koivisto")).toBe(
      "Bring your thinking, not a script: Anna Koivisto will ask you to walk through one choice and change one constraint.",
    );
  });
});
