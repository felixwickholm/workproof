import { describe, expect, it } from "vitest";
import { hueFor, initialsOf } from "./avatar";

describe("hueFor", () => {
  it("gives the same id the same number every time", () => {
    expect(hueFor("co-kaari")).toBe(hueFor("co-kaari"));
  });
});

describe("initialsOf", () => {
  it("takes the first letter, upper case", () => {
    expect(initialsOf("kaari Home Care")).toBe("K");
    expect(initialsOf("Kaari Home Care", 2)).toBe("KH");
  });

  it("falls back to a question mark for an empty name", () => {
    expect(initialsOf("  ")).toBe("?");
  });
});
