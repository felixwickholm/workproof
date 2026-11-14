import { describe, expect, it } from "vitest";
import { formatClock, formatEventDate } from "./format";

describe("dates and times", () => {
  it("writes the event date in full", () => {
    expect(formatEventDate("2026-11-14")).toBe("Saturday 14 November 2026");
  });
  it("shows a timestamp as Espoo wall-clock time", () => {
    expect(formatClock("2026-11-14T06:51:30.395Z")).toBe("08:51");
  });
  it("keeps a bad input readable instead of throwing", () => {
    expect(formatEventDate("soon")).toBe("soon");
    expect(formatClock("soon")).toBe("");
  });
});
