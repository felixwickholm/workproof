import { describe, expect, it } from "vitest";
import { initialsOf } from "./avatar";

describe("initialsOf", () => {
  it("takes the first letter, upper case", () => {
    expect(initialsOf("halla Supply")).toBe("H");
    expect(initialsOf("Halla Supply", 2)).toBe("HS");
  });

  it("falls back to a question mark for an empty name", () => {
    expect(initialsOf("  ")).toBe("?");
  });
});
