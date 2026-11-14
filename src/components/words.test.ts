import { describe, expect, it } from "vitest";
import { FORMAT_LABEL, formatTotal, plural, totalOutOf, workCode, workLabel } from "./words";

describe("plural", () => {
  it("uses the singular for one", () => {
    expect(plural(1, "challenge")).toBe("1 challenge");
    expect(plural(0, "challenge")).toBe("0 challenges");
    expect(plural(3, "person", "people")).toBe("3 people");
  });
});

describe("totals", () => {
  it("always shows one decimal", () => {
    expect(formatTotal(8)).toBe("8.0");
    expect(formatTotal(7.5)).toBe("7.5");
    expect(totalOutOf(10)).toBe("10.0 of 10");
  });
});

describe("work labels", () => {
  it("names the work plainly", () => {
    expect(workLabel("Proof K7")).toBe("Work K7");
    expect(workLabel("Work K7")).toBe("Work K7");
    expect(workCode("Proof K7")).toBe("K7");
    expect(workCode("Work K7")).toBe("K7");
  });
});

describe("FORMAT_LABEL", () => {
  it("names all four formats", () => {
    expect(Object.values(FORMAT_LABEL)).toEqual(["Choose", "Make", "Fix", "Read"]);
  });
});
