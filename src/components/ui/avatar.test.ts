import { describe, expect, it } from "vitest";
import { initialsOf } from "./avatar";

describe("initialsOf", () => {
  it("takes the first letter, upper case", () => {
    expect(initialsOf("kaari Home Care")).toBe("K");
    expect(initialsOf("Kaari Home Care", 2)).toBe("KH");
  });

  it("falls back to a question mark for an empty name", () => {
    expect(initialsOf("  ")).toBe("?");
  });
});
